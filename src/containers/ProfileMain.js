import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Social from './Social';
import SocialButton from './SocialButton'
import { getProfilePromise, getAuthUser, getUserDataFromAlias } from '../actions/UserActions'
import { getSocialItems } from '../actions/SocialActions'


import _ from 'lodash'

const ProfileHeader = props => {
  return <div><a href="/">home</a></div>
}

const ProfilePhoto = props => {
  // console.log("PROFILE PHOTO!!!!!!!!", props)
  if (props.isAuthUser) {
    return (
      <div>
        <button title="Change Profile Photo"><img src={props.src} alt="Change Profile Photo" width="72" height="72"/></button>
        <div>
          <form encType="multipart/form-data"><input accept="image/jpeg,image/png" type="file"/></form>
        </div>
      </div>
    )
  } else {
    return (
      <div>
        <div role="button">
          <span role="link"><img src={props.src} alt={`${props.userAlias}'s profile picture`} width="72" height="72"/></span>
        </div>
      </div>
    )
  }
}

const MutualFollowersList = props => {
  // const followers = Object.values(props.socialItems)
  // const followerNames =["lalal", "scout_berry", "anniegallos", "openstudiosvan", "someUser1", "someUser2"] // user.followers
  const followerNames = props.socialItems.map(item => item.alias_name)
  // console.log(followerNames)
  const MAX = (followerNames.length < 3)? followerNames.length : 3
  // console.log(followerNames.slice(0, MAX))
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
  // console.log(mutualFollowers)
  // console.log(moreFollowersNum)
  return <span>Followed by {mutualFollowers} {moreFollowersNum}</span>
}

const ProfilePage = props => {
  // console.log(props)
  const { userAlias, isAuthUser, social, socialButton, profilePhoto, authUser, mutualFollowers } = props
  // console.log(props)
  const fullName = props.full_name
  const profileDescription = props.bio
  const postsTotal = props.posts_total
  const followersTotal = props.followers_total
  const followingTotal = props.following_total
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
          {profilePhoto}
          <section>
            <div>
              <h1 title={userAlias}>{userAlias}</h1>
              {isAuthUser && <div><a href="/accounts/edit/"><button type="button">Edit Profile</button></a></div>}
              {!isAuthUser && socialButton}
            </div>
            <div>
              <span><span>{postsTotal}</span> posts </span>
              <span><a href={`/${userAlias}/followers/`}><span title={followersTotal}>{followersTotal}</span> follower{followersTotal === 1? '' : 's'} </a></span>
              <span><a href={`/${userAlias}/following/`}><span>{followingTotal}</span> following</a></span>
            </div>
            <h1>{fullName}</h1>
            <div><span>{profileDescription}</span> </div>
            {!isAuthUser && <a href={`/${userAlias}/followers`}><MutualFollowersList socialItems={mutualFollowers}/></a>}
          </section>
        </header>
        <div>
            <span>
              <div></div>
              <Link to={`/${userAlias}`}>Posts</Link>
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
    // console.log("Profile.constructor()...")
    super(props)
    this.state = {}
    this.handleTestClick = this.handleTestClick.bind(this) 
  }

  handleTestClick(e) {
    const { match, authUser, aliasToId, getMutualFollowers } = this.props
    // console.log("Profile.handleTestClick()...")
    console.log(e)
    e.preventDefault()
    // console.log(this.props) 
    // getMutualFollow(authUser.uid, 'F7G80ZQ0QffjiWtHT51tU8ztHRq1')
    const userId = aliasToId[match.params.user_alias]
    // rejectFollowRequest(userId) 
    // acceptFollowRequest(userId)
    getProfilePromise(userId).then(val=>console.log(val))
    // {userId && getProfilePromise(userId).then(profileData => console.log(`querying user ${userId} data!!!: `, profileData))}
  }
  componentDidMount() {
    // console.log("Profile.componentDidMOUNT()...")
    // console.log(this.props)
    const { match, getUserDataFromAlias, getUserCred, aliasToId, authUser } = this.props
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
    if (authUser.loggedIn && !social.isFetching && (social.items.length < 1)) {
      const userId = aliasToId[userAlias]
      if (userId) {
        console.log("GETTING MUTUAL FOLLOWERS!!!!!!!!!!")
        getMutualFollowers(userId)
      }
    }

    return null
  }

  render() {
    const { match, authUser, aliasToId, social, profiles } = this.props
    // console.log("!!!!! Profile.RENDER.... social!", this.props.social)
    const aliasName = match.params['user_alias'] 
    const userAlias = match.params && match.params['user_alias']
    const userId = aliasToId[userAlias]
    const isAuthUser = (authUser.alias_name === userAlias)

    let profileProps = {userAlias, isAuthUser}
    const profile = profiles[userId]
    if (profile) {
      profileProps = {userAlias, isAuthUser, ...profile}
    }
    const socialItems = Object.values(social.items)
    const mutualFollowers = socialItems.filter(item => item.alias_name !== authUser.alias_name)
    // console.log(socialItems)
    profileProps['mutualFollowers'] = mutualFollowers
    if (social.isFetching || !(userAlias.toLowerCase() in aliasToId)) {
      return (
        <div>
        <ProfileHeader />
        <div>Loading...</div>
        </div>
      )
    } else {
      const socialItem = (authUser.following && authUser.following[userId]) || {user_id: userId} //FIXME: This should be initialized with full user data! (Currently, data appears only when authed user is already following or after toggling the follow button.)
      // console.log(socialItem)
      const socialButton = (authUser.following && <SocialButton socialItem={socialItem} />)
      const profilePhoto = <ProfilePhoto src={socialItem.alias_image} userAlias={userAlias} isAuthUser={isAuthUser} />
      return (
          <div>
            {true && <p><a href="#" onClick={this.handleTestClick}>Test!</a></p>}
            <ProfileHeader />
            <ProfilePage 
              socialButton={socialButton}
              profilePhoto={profilePhoto}
              {...profileProps}
              {...this.props} 
            />
          </div>
      )
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
  getMutualFollowers: userId => dispatch(getSocialItems(userId, "followers", true, false)),
  getUserDataFromAlias: aliasName => dispatch(getUserDataFromAlias(aliasName)),
  getUserCred: () => dispatch(getAuthUser()),
})
 
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile)

/*

*/
