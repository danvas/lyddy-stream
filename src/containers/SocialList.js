import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import SocialItem from '../components/SocialItem';
import { toggleFollowUser, followUser, unfollowUser, getFollowStatusName } from '../actions/SocialActions';
import { deletePost } from '../actions/PostActions';
import { togglePlay } from '../actions/PlayerActions';
import { fetchUserData, updateFollowing } from '../actions/UserActions';
import SocialButton from '../containers/SocialButton'


export const SocialItemsList = props => {
    const { items, authUserId } = props
    console.log(props)
    // console.log(items)
    return items.map(user => {
      const socialButton = (user.user_id === authUserId? null : <SocialButton socialItem={user} />)
      return (
          <SocialItem key={user.user_id}
                   socialButton={socialButton}
                   userName={user.alias_name}
                   userId={user.user_id}
                   sourceImg={user.alias_image}
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
 
// export const SocialList = connect(
//   null, 
//   null
// )(SocialItemsList)
