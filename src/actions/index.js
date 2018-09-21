import { auth, usersDatabase, lyddiesDatabase } from '../Firebase';
import { updateQueue } from './PlayerActions'
export const REQUEST_POSTS = 'REQUEST_POSTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const SELECT_STREAM = 'SELECT_STREAM'
export const INVALIDATE_STREAM = 'INVALIDATE_STREAM'
export const HANDLE_FETCH_ERROR = 'HANDLE_FETCH_ERROR'
var moment = require('moment')

function getSortedPosts(posts) {
  const postValues = posts? Object.values(posts) : []
  const sortedValues = postValues.sort((a,b) => {
    return moment(b.date_added).valueOf() - moment(a.date_added).valueOf()})
  return sortedValues
}

export function selectStream(stream) {
  return {
    type: SELECT_STREAM,
    stream
  }
}

export function invalidateStream(stream) {
  return {
    type: INVALIDATE_STREAM,
    stream
  }
}

function requestPosts(userId) {
  return {
    type: REQUEST_POSTS,
    userId
  }
}

export function handleFetchError(userId, error) {
  return {
    type: HANDLE_FETCH_ERROR,
    stream: userId,
    posts: {},
    receivedAt: Date.now(),
    error
  }
}

function filterPostsByUser(userIds, posts) {
  return posts.filter(post => 
                      (userIds.includes(post.user_id) && post.public)
         )
}

function receivePosts(posts) {
  return {
    type: RECEIVE_POSTS,
    receivedAt: Date.now(),
    posts
  }
}

function fetchPosts(userIds) {
  console.log("!!!!!!!!!! FETCHING POSTS...")
  return dispatch => {
    dispatch(requestPosts(userIds))
    lyddiesDatabase.on('value', 
                        snap => {
                            const sortedPosts = getSortedPosts(snap.val())
                            const posts = filterPostsByUser(userIds, sortedPosts)
                            dispatch(receivePosts(posts))
                            dispatch(updateQueue(posts.map(post=>post.lyd_id)))
                        },
                        error => dispatch(handleFetchError(userIds[0], error))
                        );
  }
}

function shouldFetchPosts(posts) {
  if (!posts) {
    return true
  } else if (posts.isFetching) {
    return false
  } else {
    return posts.didInvalidate
  }
}

export function fetchPostsIfNeeded(streamKey, userIds) {
  return (dispatch, getState) => {
    const state = getState()
    console.log(state)
    const posts = state.postsByStream[streamKey]
    const doFetch = shouldFetchPosts(posts) && userIds.length > 0
    console.log("doFetch????????? ", doFetch)
    if (doFetch) {
      console.log("YES<,,,FETCH...")
      // dispatch(fetchPosts(userIds))
    }
  }
}