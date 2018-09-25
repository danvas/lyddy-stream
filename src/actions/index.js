import { auth, usersDatabase, lyddiesDatabase } from '../Firebase';
import { updateQueue } from './PlayerActions'
export const REQUEST_POSTS = 'REQUEST_POSTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const SELECT_STREAM = 'SELECT_STREAM'
export const INVALIDATE_STREAM = 'INVALIDATE_STREAM'
export const HANDLE_FETCH_ERROR = 'HANDLE_FETCH_ERROR'
var moment = require('moment')

function getSortedPosts(posts) {
  // const postValues = posts? Object.values(posts) : []
  let postValues = []
  let post = null
  for (post in posts) {
    postValues.push({'lyd_id':post, ...posts[post]})
  }

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

export function requestPosts(stream) {
  return {
    type: REQUEST_POSTS,
    stream
  }
}

export function handleFetchError(stream, error) {
  return {
    type: HANDLE_FETCH_ERROR,
    stream,
    posts: [],
    receivedAt: Date.now(),
    error
  }
}

function filterPostsByUser(userIds, posts) {
  return posts.filter(post => 
                      (userIds.includes(post.user_id) && post.public) 
         )
}

export function receivePosts(stream, posts) {
  return {
    type: RECEIVE_POSTS,
    stream,
    posts,
    receivedAt: Date.now(),
  }
}

function fetchPosts(stream, userIds) {
  console.log("!!!!!!!!!! FETCHING POSTS...")
  return dispatch => {
    dispatch(requestPosts(stream))
    lyddiesDatabase.on('value', 
                        snap => {
                            const sortedPosts = getSortedPosts(snap.val())
                            const posts = filterPostsByUser(userIds, sortedPosts)
                            dispatch(receivePosts(stream, posts))
                        },
                        error => dispatch(handleFetchError(stream || 'home', error))
                        );
  }
}

function shouldFetchPosts(posts) {
  const postsEmpty = !posts || posts.length === 0
  if (postsEmpty) {
    return true
  } else if (posts.isFetching) {
    return false
  } else {
    return posts.didInvalidate
  }
}
const POSTS = {"-L-jsNBCJhPN2zB9YLR7": {
        "user_id":"F7G80ZQ0QffjiWtHT51tU8ztHRq1",
        "public": true,
        "artists":["Brian Eno",
        "Kevin Shields"],
        "caption":"new stuff!!",
        "date_added":"2017-11-06T23:29:56-08:00",
        "hashtags":["chill", "ambient"],
        "liked_by":[""],
        "name":"Only Once Away My Son",
        "source":"https://www.youtube.com/watch?v=HJlmCtpOfNU"},
    "-L-pDMLDpSMd1dobJpA2": {
        "user_id":"F7G80ZQ0QffjiWtHT51tU8ztHRq1",
        "public": true,
        "artists":["Laid Back"],
        "date_added":"2017-12-08T00:24:06-08:00",
        "liked_by":["someoneElsy"],
        "name":"Fly Away/Walking In The Sunshine",
        "source":"https://www.youtube.com/watch?v=2yHrF_fSy24"},
    "-L86Q_Z_aNzez95j3AdF": {
        "user_id":"F7G80ZQ0QffjiWtHT51tU8ztHRq1",
        "public": true,
        "artists":["Nino Soprano"],
        "caption":"",
        "date_added":"2018-03-21T00:20:59-07:00",
        "hashtags":["spaghettiwestern"],
        "name":"Sigla di Nino Soprano",
        "source":"https://www.youtube.com/watch?v=RfLIjNWyAzk"}
}

export function fetchPostsIfNeeded(streamKey, userIds) {
  return (dispatch, getState) => {
    const state = getState()
    const posts = state.postsByStream[streamKey]
    const doFetch = shouldFetchPosts(posts) && userIds.length > 0
    // console.log("doFetch????????? ", doFetch)
    if (doFetch) {
      // console.log("YES, FETCH...")
      // const sortedPosts = getSortedPosts(POSTS)
      // const posts = filterPostsByUser(userIds, sortedPosts)
      // dispatch(requestPosts(streamKey))
      // dispatch(receivePosts(streamKey, posts))
      // dispatch(updateQueue(posts.map(post=>post.lyd_id)))
      dispatch(fetchPosts(streamKey, userIds))
    }
  }
}