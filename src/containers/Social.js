import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import { updateFollowing, getUserIdFromAlias, handleRequestError, isLoggedIn, getAuthUser, 
  getUserDataFromAlias, fetchUserData, logOut, getFollowing } from '../actions/UserActions'
import { toggleFollowUser, followUser, unfollowUser, getSocialNetwork, acceptFollower, removePendingRequest  } from '../actions/SocialActions'

import { updateQueue } from '../actions/PlayerActions'
import { SocialList } from '../containers/SocialList'
import Posts from '../components/Posts';
import PostLydModal from '../components/PostLydModal';
import { auth, usersDatabase, database }  from '../Firebase';

class Social extends Component {
  constructor(props) {
    console.log("Social.constructor()...")
    super(props)
    this.state = { postModalIsOpen: false }
    // console.log(props)
    this.handleTestClick = this.handleTestClick.bind(this) 
  }

  componentDidMount() {
    console.log("Social.componentDidMOUNT()...")
    // console.log(this.props)
    const { history, match, getUserDataFromAlias, getUserCred, getSocialNetwork, user } = this.props
    let userId = "XWKhkvgF6bS5Knkg8cWT1YrJOFq1"
    if (!user.uid) {
      getUserCred()
    }

    const userAlias = match.params['user_alias']
    if (userAlias && !(userAlias in user.aliasToId)) {
      getUserDataFromAlias(userAlias)
    }
  }

  static getDerivedStateFromProps(nextProps, prevState){
    console.log("Social.getDerivedStateFromProps()...", nextProps)
    const { user, social, getSocialNetwork, followers, history, match, getUserDataFromAlias } = nextProps;
    let newState = null

    const userAlias = match.params['user_alias']
    const net = match.params['social']
    const userId = user.aliasToId[userAlias]
    console.log(userId, social.isFetching)
    if (social.items.length === 0 && userId && !social.isFetching && !(social.error)) {
      console.log("GET SOCIAL NETWORK!!")
      getSocialNetwork(userId, net)
    }
    if (user.error.code === 'USERID_NOT_FOUND') {
      const erroredUsers = prevState.erroredUsers || []
      newState = {erroredUsers: [...erroredUsers, user.error.param]}
    }

    return newState
  }

  componentDidUpdate(prevProps) {
    console.log("Social.componentDidUPDATE()...")
    // console.log(prevProps.user)
    console.log(this.props)
    const { social, user, getFollowing } = this.props
  }

  handleTestClick(e) {
    console.log("Social.handleTestClick()...")
    e.preventDefault()
    console.log(this.props) 
    const { getSocialNetwork, match, selectedUserId, user } = this.props
    // followUser('F7G80ZQ0QffjiWtHT51tU8ztHRq1')
    // followUser('FAKE18j0iqfqffwhtqz10tgurz8t')
    // followUser('XWKhkvgF6bS5Knkg8cWT1YrJOFq1')
    acceptFollower('XWKhkvgF6bS5Knkg8cWT1YrJOFq1')
    const { user_alias, social } = match.params
    const userId = user.aliasToId[user_alias]
    // getSocialNetwork(userId, social)
    // getSocialNetwork(user.uid, "following")

  }
  // TODO: MOVE THIS TO DISPATCH FUNCTION! 
  // Then remove that logic in componentDidUpdate, so we're no re-rendering the entire list!
  ingestedSocialItems = (authUser, socialItems) => {

    let items = []
    if (socialItems && authUser.following) {
      var isFollowing
      var socialItem
      for (var itemUid in socialItems) {
        socialItem = socialItems[itemUid]
        console.log(authUser.uid, itemUid.user_id)
        if (authUser.uid === itemUid) {
          isFollowing = null
        } else {
          isFollowing = Object.keys(authUser.following).includes(itemUid)? 1 : 0
        }
        console.log({...socialItem, isFollowing})
        items.push({...socialItem, isFollowing})
      }
    }
    return items
  }

  toggleFollow = (user, event) => {
    event.preventDefault()
    let doFollow = user.isFollowing? false : true
    this.props.toggleFollowAction(user.user_id, doFollow)
    this.props.updateFollowing(user, this.props.user.following, doFollow)
  }


  render() {
    const { user, social, match } = this.props
    console.log("Social.RENDER()...", this.props, this.state)
    // console.log(this.state)
    const userId = user.aliasToId[match.params.user_alias]
    const noUser = this.state.erroredUsers && this.state.erroredUsers.includes(match.params.user_alias)
    const items = this.ingestedSocialItems(user, social.items)
    // console.log(social.items)
    // console.log(items)
    // console.log(following)
    return (
      <div>
        {user.loggedIn && <div>SIGNED IN: {user.uid}</div>}
        {!user.loggedIn && <a href="/login">Sign in</a>}
        {true && <p><a href="#" onClick={this.handleTestClick}>Test!</a></p>}
        {!noUser && <SocialList onToggleFollow={this.toggleFollow} items={items} />}
        {noUser && <div><h2>Sorry, this page isn't available.</h2><p>The link you followed may be broken, or the page may have been removed. Go back to <a href='/'>homepage</a>.</p></div>}
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { social, user } = state
  return {social, user}
}

const mapDispatchToProps = dispatch => ({
  getSocialNetwork: (userId, net) => dispatch(getSocialNetwork(userId, net)),
  getUserData: userId => dispatch(fetchUserData(userId)),
  getUserDataFromAlias: aliasName => dispatch(getUserDataFromAlias(aliasName)),
  getUserIdFromAlias: aliasName => dispatch(getUserIdFromAlias(aliasName)),
  getUserCred: () => dispatch(getAuthUser()),
  getFollowing: (userId) => dispatch(getFollowing(userId)),
  toggleFollowAction: (userId, doFollow) => dispatch(toggleFollowUser(userId, doFollow)),
  updateFollowing: (user, items, doFollow) => dispatch(updateFollowing(user, items, doFollow)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Social)