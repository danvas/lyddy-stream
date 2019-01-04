import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import { getFollowToggle, performFollowAction, getFollowStatusName } from '../actions/SocialActions'

const FollowButton = props => {
  return 
  (
    <div>
      <button onClick={props.doFollowAction}>{props.actioName}</button>
    </div>
  )
}

class SocialButton extends Component {

  doFollowAction(event) {
    event.preventDefault()
    const { socialItem, dispatchFollowUser } = this.props
    const doFollow = getFollowToggle(socialItem.status)
    console.log(socialItem, doFollow)
    dispatchFollowUser(socialItem.user_id, doFollow)
  }

  render() {
    const { authUser, socialItem } = this.props
    // console.log("SocialButton.RENDER()...", this.props)
    return (
      <div>
        <button onClick={e => {this.doFollowAction(e)}}>{getFollowStatusName(socialItem.status)}</button>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return { authUser: state.user,
           social: state.social }
}

const mapDispatchToProps = dispatch => ({
  dispatchFollowUser: (userItem, doFollow) => dispatch(performFollowAction(userItem, doFollow))
})

export default connect(mapStateToProps, mapDispatchToProps)(SocialButton)