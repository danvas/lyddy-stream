import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import { updateFollowing, getUserIdFromAlias, handleRequestError, isLoggedIn, getAuthUser, 
  getUserDataFromAlias, fetchUserData, logOut, getFollowing } from '../actions/UserActions'
import { getFollowToggle, performFollowAction, getFollowStatusName, followUser, unfollowUser, getSocialItems, acceptFollower, removePendingRequest } from '../actions/SocialActions'

import { updateQueue } from '../actions/PlayerActions'
import { SocialList } from '../containers/SocialList'
import Posts from '../components/Posts';
import PostLydModal from '../components/PostLydModal';
import { auth, usersDatabase, database }  from '../Firebase';

const FollowButton = props => {
  return 
  (
    <div>
      <button onClick={props.doFollowAction}>{props.actioName}</button>
    </div>
  )
}

class SocialButton extends Component {
  // constructor(props) {
  //   console.log("SocialButton.constructor()...")
  //   super(props)
  //   this.state = { postModalIsOpen: false }
  //   // console.log(props)
  //   this.handleTestClick = this.handleTestClick.bind(this) 
  // }


  doFollowAction = (userItem, event) => {
    event.preventDefault()
    const doFollow = getFollowToggle(userItem.status)
    // console.log(userItem, doFollow)
    this.props.dispatchFollowUser(userItem.user_id, doFollow)
  }

  render() {
    const { authUser, socialItem } = this.props
    // console.log("SocialButton.RENDER()...", this.props)
    // console.log("$$$$$$$$ socialItem:", socialItem)
    return (
      <div>
        <button onClick={e => {this.doFollowAction(socialItem, e)}}>{getFollowStatusName(socialItem.status)}</button>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return { authUser: state.user }
}

const mapDispatchToProps = dispatch => ({
  dispatchFollowUser: (userItem, doFollow) => dispatch(performFollowAction(userItem, doFollow)),
  updateFollowing: (user, items, doFollow) => dispatch(updateFollowing(user, items, doFollow)),
})

export default connect(mapStateToProps, mapDispatchToProps)(SocialButton)