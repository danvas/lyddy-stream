import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Social from './Social';
import SocialButton from './SocialButton'
import { getProfilePromise, getAuthUser, getUserDataFromAlias } from '../actions/UserActions'
import { respondFollowRequest, getSocialItems } from '../actions/SocialActions'


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
          <span role="link"><img src={props.src} alt={`${props.aliasName}'s profile picture`} width="72" height="72"/></span>
        </div>
      </div>
    )
  }
}

const MutualFollowersList = props => {
  // const followers = Object.values(props.socialItems)
  // const followerNames =["lalal", "scout_berry", "anniegallos", "openstudiosvan", "someUser1", "someUser2"] // user.followers
  if (props.socialItems.length === 0) {
    return null
  }
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

  const moreFollowersNum = (followerNames.length > MAX)? `+ ${followerNames.length - MAX} more` : null  
  // console.log(mutualFollowers)
  // console.log(moreFollowersNum)
  return <span>Followed by {mutualFollowers} {moreFollowersNum}</span>
}

const ProfilePage = props => {
  // console.log(props)
  const {
    isAuthUser,
    aliasName,
    aliasImage,
    fullName,
    bio,
    postsTotal,
    followersTotal,
    followingTotal, 
    socialButton, 
    mutualFollowers } = props

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
          <ProfilePhoto src={aliasImage} aliasName={aliasName} isAuthUser={isAuthUser} />
          <section>
            <div>
              <h1 title={aliasName}>{aliasName}</h1>
              {isAuthUser && <div><a href="/accounts/edit/"><button type="button">Edit Profile</button></a></div>}
              {!isAuthUser && socialButton}
            </div>
            <div>
              <span><span>{postsTotal}</span> posts </span>
              <span><a href={`/${aliasName}/followers/`}><span title={followersTotal}>{followersTotal}</span> follower{followersTotal === 1? '' : 's'} </a></span>
              <span><a href={`/${aliasName}/following/`}><span>{followingTotal}</span> following</a></span>
            </div>
            <h1>{fullName}</h1>
            <div><span>{bio}</span> </div>
            {!isAuthUser && <a href={`/${aliasName}/followers`}><MutualFollowersList socialItems={mutualFollowers}/></a>}
          </section>
        </header>
        <div>
            <span>
              <div></div>
              <Link to={`/${aliasName}`}>Posts</Link>
            </span>
            <span>
              <div></div>
              <Link to={`/${aliasName}/saved`}>Saved</Link>
            </span>
            <span>
              <div></div>
              <Link to={`/${aliasName}/tagged`}>Tagged</Link>
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
    const { match, authUser, aliasToId, respondFollowRequest } = this.props
    // console.log("Profile.handleTestClick()...")
    e.preventDefault()
    // console.log(this.props) 
    // getMutualFollow(authUser.uid, 'F7G80ZQ0QffjiWtHT51tU8ztHRq1')
    const userId = aliasToId[match.params.user_alias]
    // rejectFollowRequest(userId) 
    // respondFollowRequest(userId, true)
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
    if (authUser.loggedIn && !social.isFetching && (Object.values(social.items).length < 1)) { //FIXME: Length is a not an approproate attribute here --- because could be empty!
      const userId = aliasToId[userAlias]
      if (userId) {
        getMutualFollowers(userId)
      }
    }

    return null
  }

  render() {
    const { match, authUser, aliasToId, social, profiles } = this.props
    console.log("!!!!! Profile.RENDER")
    const aliasName = match.params['user_alias'] 
    const userAlias = match.params && match.params['user_alias']
    const userId = aliasToId[userAlias]
    const isAuthUser = (authUser.alias_name === userAlias)

    let profileProps = {userAlias, isAuthUser}
    const profile = profiles[userId]
    if (profile) {
      profileProps = {
        isAuthUser,
        aliasName: profile['alias_name'],
        aliasImage: profile['alias_image'],
        fullName: profile['full_name'],
        bio: profile['bio'],
        postsTotal: profile['posts_total'],
        followersTotal: profile['followers_total'],
        followingTotal: profile['following_total']
      }
    }
    const socialItems = Object.values(social.items)
    const followers = socialItems.filter(item => {
      return ((item.alias_name !== authUser.alias_name) && (item.status > 1))
    })
    const mutualFollowers = followers.filter(item => item.alias_name !== userAlias)
    profileProps['mutualFollowers'] = mutualFollowers
    if (social.isFetching || !(userAlias.toLowerCase() in aliasToId)) {
      return (
        <div>
        <ProfileHeader />
        <div>Loading...</div>
        </div>
      )
    } else {
      const socialItem = (authUser.following && authUser.following[userId]) || {user_id: userId}
      // console.log(socialItem)
      const socialButton = (authUser.following && <SocialButton socialItem={socialItem} />)
      return (
          <div>
            {true && <p><a href="#" onClick={this.handleTestClick}>Test!</a></p>}
            <ProfileHeader />
            <ProfilePage 
              socialButton={socialButton}
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
  respondFollowRequest: (userId, accept) => dispatch(respondFollowRequest(userId, accept))
})
 
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile)

/*

*/
