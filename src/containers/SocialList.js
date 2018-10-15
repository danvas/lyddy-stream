import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import SocialItem from '../components/SocialItem';
import { toggleFollowUser, doUnfollowUser, followUser, unfollowUser } from '../actions/SocialActions';
import { deletePost } from '../actions/PostActions';
import { togglePlay } from '../actions/PlayerActions';
import { fetchUserData, updateFollowing } from '../actions/UserActions';

const getActionName = isFollowing => {
  switch (isFollowing) {
    case 0:
      return "Follow"
    case 1:
      return "Following"
    default:
      return "that's you!"
  }
}
const SocialItemsList = props => {
    const { items, onToggleFollow } = props
    return items.map(user => {
      return (
          <SocialItem key={user.user_id}
                   onToggleFollow={e => {onToggleFollow(user, e)}}
                   followButtonName={getActionName(user.isFollowing)}
                   userName={user.alias_name}
                   {...user} 
          />
      )
    })
}

SocialItemsList.propTypes = {
  items: PropTypes.array.isRequired
}
 
// const mapDispatchToProps = (dispatch) => ({
//   toggleFollowAction: (userId, doFollow) => dispatch(toggleFollowUser(userId, doFollow)),
//   updateFollowing: items => dispatch(updateFollowing(items)),
// })
 
export const SocialList = connect(
  null, 
  null
)(SocialItemsList)
