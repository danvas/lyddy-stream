import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  selectSubreddit,
  fetchPostsIfNeeded,
  invalidateSubreddit
} from '../actions'
import { getUser, logOut } from '../actions/UserActions'
import { updateQueue } from '../actions/PlayerActions'
import Picker from '../components/Picker'
import { LydList } from '../containers/LydList'
import Posts from '../components/Posts';
import { MainPlayer } from './PlayerContainer' 
import SourceSubmitter from '../containers/SourceSubmitter'

class LyddyStream extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    const { history } = this.props;
    const { user } = nextProps;
    getUser();
    if (!user.loading && user.email === undefined) {
        history.replace('/login');
    }
  }

  componentWillMount() {
    const { user, history } = this.props;
    getUser();
    if (!user.loading && user.email === undefined) {
        history.replace('/login');
    }
  }

  componentDidMount() {
    const { selectedSubreddit, fetchPosts, match, user } = this.props
    const userAlias = match.params.user_alias
    const playlist = match.params.playlist
    let userIds = [selectedSubreddit]
    if (user.following) {
      userIds = userIds.concat(user.following)
    }
    fetchPosts(userIds)
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedSubreddit !== prevProps.selectedSubreddit) {
      const { selectedSubreddit, fetchPosts, user } = this.props
      const userIds = [selectedSubreddit].concat(user.following)
      // console.log(userIds)
      fetchPosts(userIds)
    }
  }

  handleChange(nextSubreddit) {
    const { selectSubreddit, fetchPosts, history, user } = this.props
    selectSubreddit(nextSubreddit)
    const userIds = [nextSubreddit].concat(user.following)
    fetchPosts(userIds)
    console.log(this.props)
    // updateQueue([nextSubreddit])
    history.replace(`/${nextSubreddit}`);
  }

  handleRefreshClick(e) {
    e.preventDefault()
    const { selectedSubreddit, fetchPosts, invalidateSubreddit, user } = this.props
    invalidateSubreddit(selectedSubreddit)
    const userIds = [selectedSubreddit].concat(user.following)
    fetchPosts(userIds)
  }

  render() {
    const { selectedSubreddit, posts, isFetching, lastUpdated, player } = this.props
    const { queueIdx, playing, queuedIds, currentId } = player
    return (
      <div>
       <button onClick={logOut()}>Log out</button>
       <Picker
         value={selectedSubreddit}
         onChange={this.handleChange}
         options={['reactjs', 'frontend', 'home', 'nielvas', 'XWKhkvgF6bS5Knkg8cWT1YrJOFq1', 'F7G80ZQ0QffjiWtHT51tU8ztHRq1','nielvas/playlists/someOther', '']}
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
        <SourceSubmitter/>
        {isFetching && queuedIds.length === 0 && <h2>Loading...</h2>}
        {!isFetching && queuedIds.length === 0 && <h2>Empty.</h2>}
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
  selectedSubreddit: PropTypes.string.isRequired,
  posts: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
}

function mapStateToProps(state) {
  const { selectedSubreddit, postsBySubreddit, user, player } = state
  const {
    isFetching,
    lastUpdated,
    items: posts
  } = postsBySubreddit[selectedSubreddit] || {
    isFetching: true,
    items: []
  }

  return {
    user,
    player,
    selectedSubreddit,
    posts,
    isFetching,
    lastUpdated
  }
}

const mapDispatchToProps = dispatch => ({
  fetchPosts: subreddit => dispatch(fetchPostsIfNeeded(subreddit)),
  selectSubreddit: subreddit => dispatch(selectSubreddit(subreddit)),
  invalidateSubreddit: subreddit => dispatch(invalidateSubreddit(subreddit)),
  updateQueue: posts => dispatch(updateQueue(posts)),
  getUser
})

export default connect(mapStateToProps, mapDispatchToProps)(LyddyStream)