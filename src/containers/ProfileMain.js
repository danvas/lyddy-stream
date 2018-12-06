import React, { Component } from 'react'
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import LyddyStream from './LyddyStream';
import Social from './Social';
import { updateFollowing, getUserIdFromAlias, handleRequestError, isLoggedIn, getAuthUser, 
  getUserDataFromAlias, fetchUserData, logOut, getFollowing } from '../actions/UserActions'
import { getMutualFollowPromise, getMutualFollow, toggleFollowUser, followUser, unfollowUser, getSocialNetwork, acceptFollower, removePendingRequest  } from '../actions/SocialActions'

import _ from 'lodash'

const ProfilePhoto = props => {
  const { userAlias, isAuthUser } = props
  console.log(props)
  // const userAlias = "nielvas"// props.userAlias
  const aliasImage = "https://instagram.fybz1-1.fna.fbcdn.net/vp/1c682c4c0118c5301d3b2ff86242f467/5C5F6EE6/t51.2885-19/11849347_863967993699451_152431936_a.jpg" // props.aliasImage
  // const isAuthUser = true // props.uid

  if (isAuthUser) {
    return (
      <div>
        <button title="Change Profile Photo"><img src={aliasImage} alt="Change Profile Photo"/></button>
        <div>
          <form encType="multipart/form-data"><input accept="image/jpeg,image/png" type="file"/></form>
        </div>
      </div>
    )
  } else {
    return (
      <div>
        <div role="button">
          <span role="link"><img src={aliasImage} alt={`${userAlias}'s profile picture`}/></span>
        </div>
      </div>
    )
  }
}

const MutualFollowersList = props => {
  const followers = Object.values(props.socialItems)
  // const followerNames =["lalal", "scout_berry", "anniegallos", "openstudiosvan", "someUser1", "someUser2"] // user.followers
  const followerNames = followers.map(item => item.alias_name)
  console.log(followerNames)
  const MAX = (followerNames.length < 3)? followerNames.length : 3
  console.log(followerNames.slice(0, MAX))
  const mutualFollowers = followerNames.slice(0, MAX).map((follower, idx) => {
    var followerName
    if (idx < (MAX - 1)) {
      followerName = <span><b>{follower}</b>, </span>
    } else if (idx === (MAX - 1)) {
      followerName = <span><b>{follower}</b></span>
    }
    return (<span key={idx}>{followerName}</span>)
    })
  
  if (mutualFollowers.length === 0) {
    return null
  }

  const moreFollowersNum = (followerNames.length > MAX)? `+ ${followerNames.length - MAX} more` : null  
  console.log(mutualFollowers)
  console.log(moreFollowersNum)
  return <span>Followed by {mutualFollowers} {moreFollowersNum}</span>
}

const ProfilePage = props => {
  console.log(props)
  const { userAlias, isAuthUser, social } = props
  const fullName = "(full name here)"
  const profileDescription = "(some profile blurb here)"
  const aliasImage = "https://instagram.fybz1-1.fna.fbcdn.net/vp/1c682c4c0118c5301d3b2ff86242f467/5C5F6EE6/t51.2885-19/11849347_863967993699451_152431936_a.jpg" // props.aliasImage
  const postsTotal = 344// props.postsTotal
  const followersTotal = 178// props.followersTotal
  const followingTotal = 454// props.followingTotal
  const unavailable = false // props.error.code === 'USER_NOT_FOUND'
  // const isAuthUser = true // user.uid

  if (unavailable) {
    return (
      <div><h2>Sorry, this page isn't available.</h2><p>The link you followed may be broken, or the page may have been removed. Go back to <a href='/'>homepage</a>.</p></div>
    )
  }
  return (
    <main>
      <div>
        <header>
          <ProfilePhoto userAlias={userAlias} isAuthUser={isAuthUser} />
          <section>
            <div>
              <h1 title={userAlias}>{userAlias}</h1>
              {isAuthUser && <div><a href="/accounts/edit/"><button type="button">Edit Profile</button></a></div>}
              {!isAuthUser && <button type="button">Follow</button>}
              <div><button><span aria-label="Options"></span></button></div>
            </div>
            <div>
              <span><span>{postsTotal}</span> posts </span>
              <span><a href={`/${userAlias}/followers/`}><span title={followersTotal}>{followersTotal}</span> followers </a></span>
              <span><a href={`/${userAlias}/following/`}><span>{followingTotal}</span> following</a></span>
            </div>
            <h1>{fullName}</h1>
            <div><span>{profileDescription}</span> </div>
            {!isAuthUser && (social.net === "mutual") && <a href={`/${userAlias}/followers`}><MutualFollowersList socialItems={props.social.items}/></a>}
          </section>
        </header>
        <div>
            <span>
              <div></div>
              <Link to={`/${userAlias}/`}>Posts</Link>
            </span>
            <span>
              <div></div>
              <Link to={`/${userAlias}/saved`}>Saved</Link>
            </span>
            <span>
              <div></div>
              <Link to={`/${userAlias}/tagged`}>Tagged</Link>
            </span>
        </div>

      </div>
    </main>
  )
}


class Profile extends Component {
  constructor(props) {
    console.log("Profile.constructor()...")
    super(props)
    this.state = {}
    this.handleTestClick = this.handleTestClick.bind(this) 
  }

  handleTestClick(e) {
    const { match, authUser, aliasToId, getMutualFollowers } = this.props
    console.log("Profile.handleTestClick()...")
    e.preventDefault()
    console.log(this.props) 
    // getMutualFollow(authUser.uid, 'F7G80ZQ0QffjiWtHT51tU8ztHRq1')
    const userId = aliasToId[match.params.user_alias]
    // acceptFollower("XWKhkvgF6bS5Knkg8cWT1YrJOFq1")
    getMutualFollowers(userId)
  }
  componentDidMount() {
    console.log("Profile.componentDidMOUNT()...")
    // console.log(this.props)
    const { match, getUserDataFromAlias, getSocialNetwork, getUserCred, aliasToId, authUser } = this.props
    if (!authUser.uid) {
      getUserCred()
    }

    const userAlias = match.params['user_alias']
    if (userAlias) {
      getUserDataFromAlias(userAlias)
    }
  }

  static getDerivedStateFromProps(nextProps, prevState){
    const { match, aliasToId, authUser, getMutualFollowers, social } = nextProps
    console.log(nextProps)
    const userAlias = match.params['user_alias']
    if (authUser.loggedIn && (userAlias in aliasToId) && !social.isFetching && (social.items.length < 1)) {
      getMutualFollowers(aliasToId[userAlias])
    }

    return null
  }

  render() {
    console.log(this.state)
    const { match, authUser, aliasToId, social } = this.props
    const aliasName = match.params['user_alias'] 
    const userAlias = match.params && match.params['user_alias']
    const isAuthUser = (authUser.alias_name === userAlias)
    const profileProps = {userAlias, isAuthUser}

    return (
        <div>
          {true && <p><a href="#" onClick={this.handleTestClick}>Test!</a></p>}
          <ProfilePage 
            {...profileProps}
            {...this.props} 
          />
        </div>
    )
  }
}
// export default ProfileMain
const mapStateToProps = state => {
  const { profiles, aliasToId, idToAlias, ...user } = state.user
  return {authUser: user,
          social: state.social,
          profiles,
          aliasToId, 
          idToAlias}
}
 
const mapDispatchToProps = (dispatch) => ({
  getMutualFollowers: userId => dispatch(getMutualFollow(userId)),
  getSocialNetwork: (userId, net) => dispatch(getSocialNetwork(userId, net)),
  getUserDataFromAlias: aliasName => dispatch(getUserDataFromAlias(aliasName)),
  getUserCred: () => dispatch(getAuthUser()),
  getFollowing: (userId) => dispatch(getFollowing(userId)),
  toggleFollowAction: (userId, doFollow) => dispatch(toggleFollowUser(userId, doFollow)),
  updateFollowing: (user, items, doFollow) => dispatch(updateFollowing(user, items, doFollow)),
})
 
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile)

/*

*/
