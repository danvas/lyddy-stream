import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import LydItem from '../components/LydItem';
import { deletePost } from '../actions/PostActions';
import { togglePlay } from '../actions/PlayerActions';
import { fetchUserData } from '../actions/UserActions';

const LydItemList = props => {
    const { posts, isPlaying, currentId, onDelete, onTogglePlay, idToAlias, authUserId} = props

    return posts.map(post => {
      return (
          <LydItem key={post.lyd_id}
                   onTogglePlay={() => {onTogglePlay(post.lyd_id)}}
                   playing={(currentId === post.lyd_id) && isPlaying}
                   onDelete={(authUserId === post.user_id)? () => onDelete(authUserId, post.lyd_id) : null}
                   userName={idToAlias[post.user_id]}
                   {...post} 
          />
      )
    })
}

LydItemList.propTypes = {
  posts: PropTypes.array.isRequired
}
 
const mapDispatchToProps = (dispatch) => ({
  onTogglePlay: (lydId) => dispatch(togglePlay(lydId)),
  onDelete: (userId, lydId) => dispatch(deletePost(userId, lydId)),
})
 
export const LydList = connect(
  null, 
  mapDispatchToProps
)(LydItemList)
