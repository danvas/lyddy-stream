import { auth, usersDatabase, lyddiesDatabase } from '../Firebase';
import { updateQueue } from './PlayerActions'
export const REQUEST_POSTS = 'REQUEST_POSTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const SELECT_SUBREDDIT = 'SELECT_SUBREDDIT'
export const INVALIDATE_SUBREDDIT = 'INVALIDATE_SUBREDDIT'
export const HANDLE_FETCH_ERROR = 'HANDLE_FETCH_ERROR'
var moment = require('moment')

function getSortedPosts(posts) {
  const postValues = posts? Object.values(posts) : []
  const sortedValues = postValues.sort((a,b) => {
    return moment(b.date_added).valueOf() - moment(a.date_added).valueOf()})
  return sortedValues
}

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

function requestPosts(userId) {
  return {
    type: REQUEST_POSTS,
    userId
  }
}

function handleFetchError(userId, error) {
  return {
    type: HANDLE_FETCH_ERROR,
    subreddit: userId,
    posts: {},
    receivedAt: Date.now()
  }
}

function filterPostsByUser(userIds, posts) {
  return posts.filter(post => 
                      (userIds.includes(post.user_id) && post.public)
         )
}

function receivePosts(userId, posts) {
  return {
    type: RECEIVE_POSTS,
    subreddit: userId,
    receivedAt: Date.now(),
    posts
  }
}

function fetchPosts(userIds) {
  return dispatch => {
    dispatch(requestPosts(userIds))
    lyddiesDatabase.on('value', 
                        snap => {
                            const sortedPosts = getSortedPosts(snap.val())
                            const posts = filterPostsByUser(userIds, sortedPosts)
                            dispatch(receivePosts(userIds[0], posts))
                            dispatch(updateQueue(posts.map(post=>post.lyd_id)))
                        },
                        error => dispatch(handleFetchError(userIds[0], error))
                        );
  }
}

function shouldFetchPosts(state, uid) {
  const posts = state.postsBySubreddit[uid]
  if (!posts) {
    return true
  } else if (posts.isFetching) {
    return false
  } else {
    return posts.didInvalidate
  }
}

export function fetchPostsIfNeeded(userIds) {
  return (dispatch, getState) => {
    const state = getState()
    const uid = userIds? userIds[0] : state.user.uid
    if (shouldFetchPosts(state, uid)) {
      dispatch(fetchPosts(userIds))
    }
    
  }
}