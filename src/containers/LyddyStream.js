import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  selectSubreddit,
  fetchPostsIfNeeded,
  invalidateSubreddit
} from '../actions'
import Picker from '../components/Picker'
import Posts from '../components/Posts';
import SourceSubmitter from '../containers/SourceSubmitter'

class LyddyStream extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
  }

  componentDidMount() {
    const { selectedSubreddit, fetchPosts } = this.props
    fetchPosts(selectedSubreddit)
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedSubreddit !== prevProps.selectedSubreddit) {
      const { selectedSubreddit, fetchPosts } = this.props
      fetchPosts(selectedSubreddit)
    }
  }

  handleChange(nextSubreddit) {
    const { selectSubreddit, fetchPosts } = this.props
    selectSubreddit(nextSubreddit)
    fetchPosts(nextSubreddit)
  }

  handleRefreshClick(e) {
    e.preventDefault()
    const { selectedSubreddit, fetchPosts, invalidateSubreddit } = this.props
    invalidateSubreddit(selectedSubreddit)
    fetchPosts(selectedSubreddit)
  }

  render() {
    const { selectedSubreddit, posts, isFetching, lastUpdated } = this.props
    return (
      <div>
        <Picker
          value={selectedSubreddit}
          onChange={this.handleChange}
          options={['reactjs', 'frontend', 'home', 'nielvas']}
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
        {isFetching && posts.length === 0 && <h2>Loading...</h2>}
        {!isFetching && posts.length === 0 && <h2>Empty.</h2>}
        {posts.length > 0 &&
          <div style={{ opacity: isFetching ? 0.5 : 1 }}>
            <Posts posts={posts} />
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
  const { selectedSubreddit, postsBySubreddit } = state
  const {
    isFetching,
    lastUpdated,
    items: posts
  } = postsBySubreddit[selectedSubreddit] || {
    isFetching: true,
    items: []
  }

  return {
    selectedSubreddit,
    posts,
    isFetching,
    lastUpdated
  }
}

const mapDispatchToProps = dispatch => ({
  fetchPosts: subreddit => dispatch(fetchPostsIfNeeded(subreddit)),
  selectSubreddit: subreddit => dispatch(selectSubreddit(subreddit)),
  invalidateSubreddit: subreddit => dispatch(invalidateSubreddit(subreddit))
})

export default connect(mapStateToProps, mapDispatchToProps)(LyddyStream)