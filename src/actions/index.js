import { usersDatabase, lyddiesDatabase } from '../Firebase';

export const REQUEST_POSTS = 'REQUEST_POSTS'
export const REQUEST_LYD_POSTS = 'REQUEST_LYD_POSTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const RECEIVE_LYD_POSTS = 'RECEIVE_LYD_POSTS'
export const SELECT_SUBREDDIT = 'SELECT_SUBREDDIT'
export const INVALIDATE_SUBREDDIT = 'INVALIDATE_SUBREDDIT'
export const HANDLE_FETCH_ERROR = 'HANDLE_FETCH_ERROR'

export function selectSubreddit(subreddit) {
  return {
    type: SELECT_SUBREDDIT,
    subreddit
  }
}

export function invalidateSubreddit(subreddit) {
  return {
    type: INVALIDATE_SUBREDDIT,
    subreddit
  }
}

function requestPosts(subreddit) {
  return {
    type: REQUEST_POSTS,
    subreddit
  }
}

function receivePosts(subreddit, json) {
  return {
    type: RECEIVE_POSTS,
    subreddit,
    posts: json.data.children.map(child => child.data),
    receivedAt: Date.now()
  }
}

function handleFetchError(subreddit, error) {
  return {
    type: HANDLE_FETCH_ERROR,
    subreddit,
    posts: {},
    receivedAt: Date.now()
  }
}

function fetchPosts(subreddit) {
  return dispatch => {
    dispatch(requestPosts(subreddit))
    return fetch(`https://www.reddit.com/r/${subreddit}.json`)
      .then(response => response.json())
      .then(json => dispatch(receivePosts(subreddit, json)))
      .catch(error => dispatch(handleFetchError(subreddit, error)))
  }
}

function filterPostsByUser(userId, posts) {
  const revPosts = Object.values(posts).reverse()
  console.log(revPosts)
  return revPosts.filter(post => 
                      (userId === post.user_id) && 
                       post.public)
}

function receiveLydPosts(userId, snapshot) {
  return {
    type: RECEIVE_LYD_POSTS,
    subreddit: userId,
    posts: filterPostsByUser(userId, snapshot),
    receivedAt: Date.now()
  }
}
function requestLydPosts(userId) {
  return {
    type: REQUEST_LYD_POSTS,
    userId
  }
}

function fetchLydPosts(userId) {
  return dispatch => {
    // dispatch(requestLydPosts(userId))
    lyddiesDatabase.on('value', 
                        snap => {
                            const snapshot = snap.val()
                            console.log("receiveLydPosts(userId, snapshot)...")
                            dispatch(receiveLydPosts(userId, snapshot))
                        },
                        error => console.log('An error occurred.', error)
                        );
  }
}

function shouldFetchPosts(state, subreddit) {
  const posts = state.postsBySubreddit[subreddit]
  if (!posts) {
    return true
  } else if (posts.isFetching) {
    return false
  } else {
    return posts.didInvalidate
  }
}

export function fetchPostsIfNeeded(subreddit) {
  return (dispatch, getState) => {
    if (shouldFetchPosts(getState(), subreddit)) {
      dispatch(fetchLydPosts("XWKhkvgF6bS5Knkg8cWT1YrJOFq1"))
      return dispatch(fetchPosts(subreddit))
    }
  }
}