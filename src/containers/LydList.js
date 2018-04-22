import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import LydItem from '../components/LydItem';
import { deletePost } from '../actions/PostActions';
import { togglePlay } from '../actions/PlayerActions';

const LydItemList = props => {
    const { posts, playingLydId, onDelete, onTogglePlay } = props
    let lyd = {}

    return posts.map(post => {
      return (
          <LydItem key={post.lyd_id}
                   onTogglePlay={() => {onTogglePlay(post.lyd_id)}}
                   playing={playingLydId === post.lyd_id}
                   onDelete={() => {onDelete(post.lyd_id)}}
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
  onDelete: (lydId) => dispatch(deletePost(lydId))
  
})
 
export const LydList = connect(
  null, 
  mapDispatchToProps
)(LydItemList)
