import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import { performFollowAction, getFollowStatusName } from '../actions/SocialActions'

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
    console.log(socialItem)
    dispatchFollowUser(socialItem.user_id, socialItem.status || 0)
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
  dispatchFollowUser: (userId, statusCode) => dispatch(performFollowAction(userId, statusCode))
})

export default connect(mapStateToProps, mapDispatchToProps)(SocialButton)