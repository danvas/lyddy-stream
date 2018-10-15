import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import {
  selectStream,
  fetchPostsIfNeeded,
  invalidateStream
} from '../actions'
import { getUserIdFromAlias, handleRequestError, isLoggedIn, getAuthUser, 
  getUserDataFromAlias, fetchUserData, logOut } from '../actions/UserActions'
import { updateQueue } from '../actions/PlayerActions'
import Picker from '../components/Picker'
import { LydList } from '../containers/LydList'
import Posts from '../components/Posts';
import PostLydModal from '../components/PostLydModal';
import PageNotFound from '../components/PageNotFound';
import { MainPlayer } from './PlayerContainer' 
import SourceSubmitter from '../containers/SourceSubmitter'
import { auth, usersDatabase, database }  from '../Firebase';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }
  
  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    // You can also log error messages to an error reporting service here
  }
  
  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }  
}

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
    this.handleTestClick = this.handleTestClick.bind(this) 
    this.refreshQueuedIds = this.refreshQueuedIds.bind(this) 
  }

  componentDidMount() {
    console.log("LyddyStream.componentDidMOUNT()...")
    // console.log(this.props)
    const { history, match, getUserIdFromAlias, selectedStream, getUserCred, fetchPosts, user } = this.props
    
    if (!user.uid) {
      getUserCred()
    }

    const userAlias = match.params['user_alias']
    if (userAlias && !(userAlias in user.aliasToId)) {
      getUserIdFromAlias(userAlias)
    }
  }

  // static getDerivedStateFromProps(nextProps, prevState){
  //   console.log("LyddyStream.getDerivedStateFromProps()...", nextProps)
  //   const { user, userRequestError, history, match, getUserDataFromAlias, getUserCred, selectStream } = nextProps;
  //   return null
  // }

  componentDidUpdate(prevProps) {
    console.log("LyddyStream.componentDidUPDATE()...")
    // console.log(prevProps.user)
    console.log(this.props)
    const { history, updateQueue, userRequestError, getUserDataFromAlias, getUserData,
      selectStream, selectedStream, fetchPosts, user, match, 
      player, posts, isFetching } = this.props

    if (user.pendRequests.length > 0) {
      return
    }
    if (user.error.code) {
      if (user.error.code === 'USER_UNAUTHENTICATED') {
        // history.replace('/login')
      }
      return
    }

    let streamKey = ''
    const userAlias = match.params['user_alias']
    if (userAlias) {
      const userId = user.aliasToId[userAlias] || userAlias
      streamKey = user.aliasToId[userAlias] || ''
      if (!(userId in user.profiles)) {
        getUserData(userId)
      }
    }

    if (streamKey !== selectedStream) {
      selectStream(streamKey)
    }

    fetchPosts(streamKey)
    this.refreshQueuedIds(posts, player.queuedIds)
  }


  refreshQueuedIds(posts, queuedIds) {
    const { updateQueue } = this.props
    if (posts.length === 0) {
      return
    }
    const postsIds = posts.map(post => post.lyd_id)
    const postsIdsOrig = postsIds.slice()
    const queuedIdsOrig = queuedIds.slice()
    const hasChanged = !_.isEqual(postsIdsOrig.sort(), queuedIdsOrig.sort())
    if (hasChanged){
      // console.log("REFRESH QUEUE!!! ", postsIds)
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
    const { getUserData, userRequestError, selectStream, selectedStream, fetchPosts, history, user } = this.props
    const doErrorReset = Object.keys(user.error).length > 0 && (user.error.param !== nextStream)
    if (doErrorReset){
      userRequestError({})
    }
    history.push(`/${nextStream}`);
  }

  refreshPosts() {
    const { selectedStream, fetchPosts, invalidateStream, user } = this.props
    invalidateStream(selectedStream)
    const userIds = this.getStreamUserIds(selectedStream, user)
    fetchPosts(selectedStream, userIds)
  }

  handleTestClick(e) {
    console.log("LyddyStream.handleTestClick()...")
    e.preventDefault()
    console.log(this.props) 
    const { fetchPosts, selectedStream, user } = this.props
    // followUser('F7G80ZQ0QffjiWtHT51tU8ztHRq1')
    // getFollowers(user.uid)
    // acceptFollower('XWKhkvgF6bS5Knkg8cWT1YrJOFq1')
    // .then(snap=>console.log(snap.val())) 
    const mockFolRequests = {"XWKhkvgF6bS5Knkg8cWT1YrJOFq1":{"date_added":"2018-10-07T01:31:41-07:00"},"asdfasdgasfg":{"date_added":"gfsd"}}
    const userIds = Object.keys(mockFolRequests)
    // acceptFollower(userIds[0])
    // removePendingRequest('F7G80ZQ0QffjiWtHT51tU8ztHRq1')

  }

  handleRefreshClick(e) {
    console.log("LyddyStream.handleRefreshClick()...")
    e.preventDefault()
    this.refreshPosts()
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
    // console.log(this.state)
    const currentLyd = posts.find(post=> post.lyd_id === player.currentId)
    const aliasNames = Object.values(user.idToAlias) 
    const renderPostButton = user.loggedIn && ((user.uid === selectedStream) || (selectedStream === ''))
    const hasError = (user.error.code !== undefined) && (user.error.code !== 'USER_UNAUTHENTICATED')
    const isPrivate = (user.profiles[selectedStream] && !user.profiles[selectedStream]['public']) && !user.loggedIn
    return (
      <div>
       {user.loggedIn && <button onClick={this.handleLogout}>Sign out</button>}
       {!isPrivate && !user.loggedIn && <a href="/login">Sign in</a>}
       {aliasNames.length > 0 && 
        <Picker
                value={user.idToAlias[selectedStream] || ''}
                onChange={this.handleChange}
                options={['', 'danvas/followers','nielvas/followers', 'accounts', 'errored'].concat(aliasNames)}
              />
        }
        <p>
          {false && lastUpdated &&
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
              {' '}
            </span>}
          {false && !isFetching &&
            <a href="#" onClick={this.handleRefreshClick}>
              Refresh
            </a>}
        </p>
        {false && <p><a href="#" onClick={this.handleTestClick}>Test!</a></p>}
        {renderPostButton && !hasError && user.loggedIn && <button onClick={this.toggleModal}>{this.state.postModalIsOpen? "cancel" : "New track"}</button>}
        {renderPostButton && <PostLydModal show={this.state.postModalIsOpen} onClose={this.toggleModal}></PostLydModal>}
        {(user.pendRequests.length > 0) && queuedIds.length === 0 && <h2>Loading...</h2>}
        {(false && !hasError && !(user.pendRequests.length > 0) && queuedIds.length === 0 && user.loggedIn) && <h2>Empty.</h2>}
        {!hasError && isPrivate && <div><h2>This account is private.</h2><p>Already follow {user.idToAlias[selectedStream]}? <a href='/login'>Sign in</a> to see their posts.</p></div>}
        {hasError && <div><h2>Sorry, this page isn't available.</h2><p>The link you followed may be broken, or the page may have been removed. Go back to <a href='/'>homepage</a>.</p></div>}
        {!hasError &&
          <div style={{ opacity: isFetching ? 0.5 : 1 }}>
          {player.currentId && <MainPlayer lyd={currentLyd}/>}
          <hr></hr>
          <LydList isPlaying={player.playing} authUserId={user.uid} idToAlias={user.idToAlias} posts={posts} currentId={player.currentId} />
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
  console.log(state)
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
  fetchPosts: (stream) => dispatch(fetchPostsIfNeeded(stream)),
  selectStream: (stream) => dispatch(selectStream(stream)),
  invalidateStream: stream => dispatch(invalidateStream(stream)),
  updateQueue: posts => dispatch(updateQueue(posts)),
  getUserData: userId => dispatch(fetchUserData(userId)),
  getUserDataFromAlias: aliasName => dispatch(getUserDataFromAlias(aliasName)),
  getUserIdFromAlias: aliasName => dispatch(getUserIdFromAlias(aliasName)),
  userRequestError: error => dispatch(handleRequestError(error)),
  getUserCred: () => dispatch(getAuthUser()),
  logOut: () => dispatch(logOut()),
})

export default connect(mapStateToProps, mapDispatchToProps)(LyddyStream)