import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateFollowing, getUserIdFromAlias, handleRequestError, isLoggedIn, getAuthUser, 
  getUserDataFromAlias, fetchUserData, logOut, getFollowing } from '../actions/UserActions'
import { getMutualFollow, toggleFollowUser, followUser, unfollowUser, getSocialNetwork, acceptFollower, removePendingRequest  } from '../actions/SocialActions'

import _ from 'lodash'

const renderProfilePhoto = props => {
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

const renderMutualFollowers = props => {
  const { userAlias, isAuthUser, social } = props
  const socialItems = Object.values(social.items)
  // const followers = []//["scout_berry", "anniegallos", "openstudiosvan", "someUser1", "someUser2"] // user.followers
  // for (var item in socialItems) {
  //   followers.push(follower.alias_name)
  // }
  const followers = socialItems.map(item => item.alias_name)
  console.log(followers)
  const MAX = (followers.length < 3)? followers.length : 3
  const mutualFollowers = followers.slice(0, MAX).map((follower, idx) => {
      const keyId = idx // follower.userId
      var followerName
      if (idx < (MAX - 1)) {
        followerName = `${follower}, `
      } else if (idx === (MAX - 1)) {
        followerName = `${follower} `
      }
      // console.log(followerName)
      return (<span key={keyId} >{followerName}</span>)
    })

  const otherFollowers = (followers.length > MAX)? `+ ${followers.length - MAX} more` : ""
  return (
    <a href={`/${userAlias}/followers/mutualOnly`}>
      <span>Followed by {mutualFollowers} {otherFollowers}</span>
    </a>
  )
}

const ProfilePage = props => {
  console.log(props)
  const { userAlias, isAuthUser } = props
  const fullName = "(full name here)"
  const profileDescription = "(some profile spiel here)"
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
          {renderProfilePhoto(props)}
          <section>
            <div>
              {isAuthUser && <div><h1 title={userAlias}>{userAlias}</h1><a href="/accounts/edit/"><button type="button">Edit Profile</button></a></div>}
              {!isAuthUser && <button type="button">Follow</button>}
              <div><button><span aria-label="Options"></span></button></div>
            </div>
            <ul>
              <li><span><span>{postsTotal}</span> posts</span></li>
              <li><a href={`/${userAlias}/followers/`}><span title={followersTotal}>{followersTotal}</span> followers</a></li>
              <li><a href={`/${userAlias}/following/`}><span>{followingTotal}</span> following</a></li>
            </ul>
            <h1>{fullName}</h1>
            <div><span>{profileDescription}</span> </div>
            {renderMutualFollowers(props)}
          </section>

        </header>

        <div>
          <a href="/{userAlias}/">
            <span>
              <div></div>
              <span>Posts</span>
            </span>
          </a>
          <a href="/{userAlias}/saved/">
            <span>
              <div></div>
              <span>Saved</span>
            </span>
          </a>
          <a href="/{userAlias}/tagged/">
            <span>
              <div></div>
              <span>Tagged</span>
            </span>
          </a>
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
    const { match, authUser, aliasToId } = this.props
    console.log("Profile.handleTestClick()...")
    e.preventDefault()
    console.log(this.props) 
    // getMutualFollow(authUser.uid, 'F7G80ZQ0QffjiWtHT51tU8ztHRq1')
    const userId = aliasToId[match.params.user_alias]
    getMutualFollow(authUser.uid, userId)
    .then(followers => console.log(followers))

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
    const { match, aliasToId, getSocialNetwork, social } = nextProps
    console.log(nextProps)
    const userAlias = match.params['user_alias']
    if ((userAlias in aliasToId) && !social.isFetching && (social.items.length < 1)) {
      getSocialNetwork(aliasToId[userAlias], "following") //TODO: Where to put this!?!?!
    }
    return null
  }

  render() {
    const { match, authUser, aliasToId } = this.props
    const aliasName = match.params['user_alias'] 
    const userAlias = match.params && match.params['user_alias']
    const isAuthUser = (authUser.user_alias === userAlias)
    const profileProps = {userAlias, isAuthUser}
    if (!authUser.isLoading && aliasName) {
      return (
        <div>
          {true && <p><a href="#" onClick={this.handleTestClick}>Test!</a></p>}
          <ProfilePage 
            {...profileProps}
            {...this.props} 
          />
        </div>
      )
    } else {
      return <div>Loading...</div>
    }
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
