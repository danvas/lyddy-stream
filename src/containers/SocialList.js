import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import SocialItem from '../components/SocialItem';
import { deletePost } from '../actions/PostActions';
import { togglePlay } from '../actions/PlayerActions';
import { fetchUserData } from '../actions/UserActions';

const SocialItemsList = props => {
    const { items, following, isPlaying, currentId, onDelete, onTogglePlay, idToAlias, authUserId} = props
    return items.map(user => {

      return (
          <SocialItem key={user.user_id}
                   onTogglePlay={() => {onTogglePlay(user.user_id)}}
                   isFollowing={user.user_id in Object.keys(following)}
                   onDelete={(authUserId === user.user_id)? () => onDelete(authUserId, user.lyd_id) : null}
                   userName={user.user_alias}
                   {...user} 
          />
      )
    })
}

SocialItemsList.propTypes = {
  items: PropTypes.array.isRequired
}
 
const mapDispatchToProps = (dispatch) => ({
  onTogglePlay: (lydId) => dispatch(togglePlay(lydId)),
  onDelete: (userId, lydId) => dispatch(deletePost(userId, lydId)),
})
 
export const SocialList = connect(
  null, 
  mapDispatchToProps
)(SocialItemsList)
