import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import {
  selectStream,
  fetchPostsIfNeeded,
  invalidateStream
} from '../actions'
import { handleRequestError, isLoggedIn, getUser, fetchUserData, logOut, toUserId } from '../actions/UserActions'
import { updateQueue } from '../actions/PlayerActions'
import Picker from '../components/Picker'
import { LydList } from '../containers/LydList'
import Posts from '../components/Posts';
import PostLydModal from '../components/PostLydModal';
import PageNotFound from '../components/PageNotFound';
import { MainPlayer } from './PlayerContainer' 
import SourceSubmitter from '../containers/SourceSubmitter'
import { auth, usersDatabase, database }  from '../Firebase';
class LyddyStream extends Component {
  constructor(props) {
    console.log("LyddyStream.constructor()...")
    super(props)
    this.state = { postModalIsOpen: false }
    // console.log(props)
    const { getUserCred, user, match, getUserData } = props
    this.handleChange = this.handleChange.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.handleRefreshClick = this.handleRefreshClick.bind(this) 
    this.handleFetchClick = this.handleFetchClick.bind(this) 
    this.refreshQueuedIds = this.refreshQueuedIds.bind(this) 
  }

  getCachedUserId = userKey => {
    const { user, getUserData, selectStream} = this.props
    let streamId = null
    if (userKey in user.aliasMap){
      streamId = user.aliasMap[userKey]
    } else if (userKey in Object.values(user.aliasMap)) {
      streamId = userKey
    }
    return streamId
  }

  componentDidMount() {
    console.log("LyddyStream.componentDidMOUNT()...")
    // console.log(this.props)
    const { history, getUserData, match, selectedStream, getUserCred, fetchPosts, user } = this.props
    if (!user.uid) {
      getUserCred()
    }
  }

  getStreamUserIds = (streamKey, profiles, authUserId) => {
    // console.log(streamKey, profiles, authUserId)
    let userIds = []
    let userId = streamKey || authUserId
    // console.log(userId)
    // console.log(!userId || Object.keys(profiles).length === 0 || !profiles[userId])
    if (!userId || Object.keys(profiles).length === 0 || !profiles[userId]) {
      // console.log("NADA!: ", userIds)
      return userIds
    }

    userIds = [userId]
    const following = profiles[userId]['following']
    // console.log("FOLLOWING =", following)
    if (streamKey === '') {
      userIds = userIds.concat(Object.keys(following))
    }

    return userIds
  }

  componentDidUpdate(prevProps) {
    console.log("LyddyStream.componentDidUPDATE()...")
    // console.log(prevProps)
    // console.log(this.props)
    const { history, updateQueue, userRequestError, getUserData, selectStream, 
      selectedStream, fetchPosts, user, match, player, posts } = this.props

    // if (user.error['code'] === 'PERMISSION_DENIED') {
    //   userRequestError({}) // reset error to empty
    //   return
    // }

    const userAlias = match.params['user_alias']
    if (userAlias) {
      // console.log(userAlias)
      // this.getCachedUserId(userAlias)
      if (!user.isLoading && !(userAlias in user.aliasMap)) {

        toUserId(userAlias)
        .then(snap => {
          const streamKey = snap.val()
          // console.log(streamKey)
          if (streamKey === null) {
            throw new Error(`Alias '${userAlias}' doesn't exist`)
          }
          getUserData(streamKey)
          if (selectedStream !== streamKey) {
            selectStream(streamKey)
          }
          return streamKey
        }, err => console.log(err))
        // .then(streamKey => console.log("streamKey =",streamKey))
        .catch(err => {
          console.log(err)
        })
      } else if (userAlias in user.aliasMap) {
        // console.log("alias already in cache... selecStream? ", selectedStream)
      }
    } else {
      if (user.loggedIn && !user.isLoading) {
        if (!(user.uid in user.profiles)) {
          getUserData(user.uid)
        }
        if (selectedStream !== "") {
          selectStream("")
        }
      }
    }
    let userIds = this.getStreamUserIds(selectedStream, user.profiles, user.uid)
    // console.log(isFetching)
    // if (userIds.length > 0){ // Might not be needed (see `doFetch` conditional in fetchPostsIfNeeded)
      // console.log("!!!!? FETCH THESE POSTS? ", userIds)//.map(id=>user.profiles[id]['alias_name']))
    // }
    fetchPosts(selectedStream, userIds)
    this.refreshQueuedIds(posts, player.queuedIds)
  }

  refreshQueuedIds = (posts, queuedIds) => {
    const { updateQueue } = this.props
    if (posts.length === 0) {
      return
    }
    const postsIds = posts.map(post => post.lyd_id)
    const postsIdsOrig = postsIds.slice()
    const queuedIdsOrig = queuedIds.slice()
    const hasChanged = !_.isEqual(postsIdsOrig.sort(), queuedIdsOrig.sort())
    if (hasChanged){
      console.log("REFRESH QUEUE!!! ", postsIds)
      updateQueue(postsIds)
    }
  }

  handleLogout() {
    console.log("LyddyStream.handleLogout()...")
    const { history, user, logOut } = this.props
    logOut()
  }

  handleChange(nextStream) {
    console.log("LyddyStream.handleChange()...", `'${nextStream}'`)
    const { getUserData, selectStream, fetchPosts, history, user } = this.props
    let streamKey = nextStream
    if (nextStream in user.aliasMap) {
      streamKey = user.aliasMap[nextStream]
      selectStream(streamKey)
    }
    const userIds = this.getStreamUserIds(streamKey, user.profiles, user.uid)
    fetchPosts(streamKey, userIds)
    history.replace(`/${nextStream}`);
  }

  refreshPosts() {
    const { selectedStream, fetchPosts, invalidateStream, user } = this.props
    invalidateStream(selectedStream)
    const userIds = [selectedStream].concat(user.following)
    // fetchPosts(userIds)
  }

  handleFetchClick(e) {
    console.log("LyddyStream.handleFetchClick()...")
    e.preventDefault()
    console.log(this.props) 
    const { fetchPosts, selectedStream, user } = this.props
    let userIds = this.getStreamUserIds(selectedStream, user.profiles, user.uid)
    fetchPosts(selectedStream, userIds)
  }

  handleRefreshClick(e) {
    console.log("LyddyStream.handleRefreshClick()...")
    e.preventDefault()
    this.refreshPosts()
    // const { selectedStream, fetchPosts, invalidateStream, user } = this.props
    // invalidateStream(selectedStream)
    // const userIds = [selectedStream].concat(user.following)
    // // fetchPosts(userIds)
  }

  toggleModal = () => {
    this.setState({
      postModalIsOpen: !this.state.postModalIsOpen
    });
  }

  render() {
    const { selectedStream, posts, user, isFetching, lastUpdated, player, logOut } = this.props
    const { queueIdx, playing, queuedIds, currentId } = player
    console.log("LyddyStream.RENDER()...", this.props)
    // console.log("loading? logged in?", user.isLoading, isLoggedIn())
    return (
      <div>
       {user.loggedIn && <button onClick={this.handleLogout}>Sign out</button>}
       {!user.loggedIn && <a href="/login">Sign in</a>}
       <Picker
         value={selectedStream}
         onChange={this.handleChange}
         options={['reactjs', 'frontend', 'home', 'danvas', 'nielvas', 'XWKhkvgF6bS5Knkg8cWT1YrJOFq1', 'F7G80ZQ0QffjiWtHT51tU8ztHRq1','nielvas/playlists/someOther', '']}
       />
        <p>
          {lastUpdated &&
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
              {' '}
            </span>}
          {!isFetching &&
            <a href="#" onClick={this.handleRefreshClick}>
              Refresh
            </a>}
        </p>
        {false && <p><a href="#" onClick={this.handleFetchClick}>Test!</a></p>}
        {user.loggedIn && <button onClick={this.toggleModal}>{this.state.postModalIsOpen? "cancel" : "New track"}</button>}
        <PostLydModal show={this.state.postModalIsOpen} onClose={this.toggleModal}></PostLydModal>
        {user.isLoading && queuedIds.length === 0 && <h2>Loading...</h2>}
        {!user.isLoading && queuedIds.length === 0 && <h2>Empty.</h2>}
        {queuedIds.length > 0 &&
          <div style={{ opacity: isFetching ? 0.5 : 1 }}>
          {player.currentId && <MainPlayer lyd={posts.find(post=> post.lyd_id === player.currentId)}/>}
          <LydList posts={posts} playingLydId={currentId} />
          </div>}
      </div>
    )
  }
}

LyddyStream.propTypes = {
  selectedStream: PropTypes.string.isRequired,
  posts: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
}

function mapStateToProps(state) {
  const { selectedStream, postsByStream, user, player } = state
  const {
    isFetching,
    lastUpdated,
    items: posts
  } = postsByStream[selectedStream] || {
    isFetching: true,
    items: []
  }

  return {
    user,
    player,
    selectedStream,
    posts,
    isFetching,
    lastUpdated
  }
}

const mapDispatchToProps = dispatch => ({
  fetchPosts: (stream, userIds) => dispatch(fetchPostsIfNeeded(stream, userIds)),
  selectStream: (stream) => dispatch(selectStream(stream)),
  invalidateStream: stream => dispatch(invalidateStream(stream)),
  updateQueue: posts => dispatch(updateQueue(posts)),
  getUserData: userId => dispatch(fetchUserData(userId)),
  userRequestError: error => dispatch(handleRequestError(error)),
  getUserCred: () => dispatch(getUser()),
  logOut: () => dispatch(logOut()),
})

export default connect(mapStateToProps, mapDispatchToProps)(LyddyStream)