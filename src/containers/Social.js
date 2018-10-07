import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import { getUserIdFromAlias, handleRequestError, isLoggedIn, getUser, 
  getUserDataFromAlias, fetchUserData, logOut } from '../actions/UserActions'
import { fetchFollowersIfNeeded, followUser, unfollowUser, getSocialNetwork, acceptFollower, removePendingRequest  } from '../actions/SocialActions'

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
    const { history, match, getUserIdFromAlias, getUserCred, getSocialNetwork, user } = this.props
    let userId = "XWKhkvgF6bS5Knkg8cWT1YrJOFq1"
    if (!user.uid) {
      getUserCred()
    }

    const userAlias = match.params['user_alias']
    if (userAlias && !(userAlias in user.aliasToId)) {
      getUserIdFromAlias(userAlias)
    }
  }

  static getDerivedStateFromProps(nextProps, prevState){
    console.log("Social.getDerivedStateFromProps()...", nextProps)
    const { user, social, getSocialNetwork, followers, history, match, getUserDataFromAlias } = nextProps;
    

    const userAlias = match.params['user_alias']
    const userId = user.aliasToId[userAlias]
    console.log(userId, social.isFetching)
    if (social.items.length === 0 && userId && !social.isFetching && !(social.error)) {
      console.log("GET SOCIAL NETWORK!!")
      getSocialNetwork(userId, "following")
    }
    return null
  }

  handleTestClick(e) {
    console.log("Social.handleTestClick()...")
    e.preventDefault()
    console.log(this.props) 
    const { getSocialNetwork, match, selectedUserId, user } = this.props
    // followUser('F7G80ZQ0QffjiWtHT51tU8ztHRq1')
    // followUser('FAKE18j0iqfqffwhtqz10tgurz8t')
    // followUser('XWKhkvgF6bS5Knkg8cWT1YrJOFq1')
    // acceptFollower('XWKhkvgF6bS5Knkg8cWT1YrJOFq1')
    const { user_alias, social } = match.params
    const userId = user.aliasToId[user_alias]
    getSocialNetwork(userId, social)

  }
  render() {
    const { user, social } = this.props
    console.log("Social.RENDER()...", this.props)
    // console.log(this.state)
    const noUser = (user.error.code === "USERID_NOT_FOUND")
    return (
      <div>
        <div>USER: {user.uid}</div>
        <p><a href="#" onClick={this.handleTestClick}>Test!</a></p>
        {!noUser && <SocialList isFollowing={false} authUserId={user.uid} idToAlias={user.idToAlias} following={social.items} items={social.items} currentId={0} />}
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
  getUserCred: () => dispatch(getUser()),
})

export default connect(mapStateToProps, mapDispatchToProps)(Social)