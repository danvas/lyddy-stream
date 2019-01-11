import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import { getUserIdFromAlias, getAuthUser, getUserDataFromAlias, getFollowing } from '../actions/UserActions'
import { performFollowAction, getSocialItems } from '../actions/SocialActions'
import { SocialItemsList } from '../containers/SocialList'

class Social extends Component {
  constructor(props) {
    // console.log("Social.constructor()...")
    super(props)
    this.state = { postModalIsOpen: false,
                   limitInc: 0 }
    // console.log(props)
    this.handleTestClick = this.handleTestClick.bind(this) 
  }

  componentDidMount() {
    // console.log("Social.componentDidMOUNT()...")
    // console.log(this.props)
    const { history, match, getUserDataFromAlias, getUserCred, user } = this.props
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
    // console.log("Social.getDerivedStateFromProps()...", nextProps)
    const { user, social, getMutualNetwork, followers, history, match, getUserDataFromAlias } = nextProps;
    let newState = null

    const userAlias = match.params['user_alias']
    const net = match.params['social']
    const userId = user.aliasToId[userAlias]
    if (Object.values(social.items).length === 0 && userId && !social.isFetching && !(social.error)) {
      console.log("GET SOCIAL NETWORK!!")
      getMutualNetwork(userId, net)
    }
    if (user.error.code === 'USERID_NOT_FOUND') {
      const erroredUsers = prevState.erroredUsers || []
      newState = {erroredUsers: [...erroredUsers, user.error.param]}
    }

    return newState
  }

  handleTestClick(e) {
    // console.log("Social.handleTestClick()...")
    e.preventDefault()
    // console.log(this.props) 
    const { getSocialNetwork, match, selectedUserId, user, getMutualNetwork } = this.props
    const { user_alias, social } = match.params
    const userId = user.aliasToId[user_alias]
    const net = match.params['social']
    // console.log(userId, social)
    getMutualNetwork(userId, net)
  }

  toggleFollow = (user, event) => {
    event.preventDefault()
    this.props.toggleFollowAction(user.user_id, user.status)
  }


  render() {
    const { user, social, match } = this.props
    console.log("Social.RENDER()...", this.props.social)
    // console.log(this.state)
    const userId = user.aliasToId[match.params.user_alias]
    const noUser = this.state.erroredUsers && this.state.erroredUsers.includes(match.params.user_alias)
    // console.log(social.items)
    // console.log(following)
    return (
      <div>
        {user.loggedIn && <div>SIGNED IN: {user.uid}</div>}
        {!user.loggedIn && <a href="/login">Sign in</a>}
        {true && <p><a href="#" onClick={this.handleTestClick}>Test requests!</a></p>}
        {!noUser && <SocialItemsList authUserId={user.uid} onToggleFollow={this.toggleFollow} items={Object.values(social.items)} />}
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
  getMutualNetwork: (userId, net) => dispatch(getSocialItems(userId, net, true, false)),
  getUserDataFromAlias: aliasName => dispatch(getUserDataFromAlias(aliasName)),
  getUserIdFromAlias: aliasName => dispatch(getUserIdFromAlias(aliasName)),
  getUserCred: () => dispatch(getAuthUser()),
  toggleFollowAction: (userId, statusCode) => dispatch(performFollowAction(userId, statusCode)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Social)