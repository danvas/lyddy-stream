import { auth, usersDatabase, lyddiesDatabase, postsDatabase } from '../Firebase';
import { updateQueue } from './PlayerActions'
export const REQUEST_POSTS = 'REQUEST_POSTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const SELECT_STREAM = 'SELECT_STREAM'
export const INVALIDATE_STREAM = 'INVALIDATE_STREAM'
export const HANDLE_FETCH_ERROR = 'HANDLE_FETCH_ERROR'
var moment = require('moment')

function getSortedPosts(posts) {
  const postValues = posts.slice()
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
  var postsQuery
  // console.log(userIds, firstId, lastId)
  if (userIds.length === 1) {
    postsQuery = postsDatabase.orderByKey().equalTo(userIds[0])
  } else {
    userIds.sort()
    const firstId = userIds[0]
    const lastId = userIds[userIds.length - 1]
    // TODO: Remove this depenency on "orderByKey". It's breaking increment of "total" transaction! (see PostActions' savePost function)
    postsQuery = postsDatabase.orderByKey().startAt(firstId).endAt(lastId)
  }
 
  const authUserId = auth.currentUser && auth.currentUser.uid
  const keepPost = (userId, post) => {
    // 1) Always fetch authenticated user's post
    if (userId === authUserId) {
      return true
    }
    // 2) PRECONDITION: If the list userIds has more than 1 item, those extra items were
    //                  derived from the authenticated user's 'follows' list.
    if (userIds.includes(userId)) {
      if (authUserId !== null) {
        return true
      }
      // If user not authenticated, fetch only if post is public.
      return post.public
    }

    return false
  }

  return dispatch => {
    // console.log("!!!!!!!!!! FETCHING POSTS! : ", stream, userIds, auth.currentUser)
    dispatch(requestPosts(stream))
    postsQuery.on('value', 
                postsSnapshot => {
                    let posts = []
                    var post
                    postsSnapshot.forEach(userSnap => {
                      userSnap.forEach(postSnap => {
                        post = postSnap.val()
                        const shouldKeep = keepPost(userSnap.key, post)
                        if (shouldKeep) {
                          const lyd = {...post, 'lyd_id': postSnap.key}
                          posts.push(lyd)
                        }
                      })
                    })

                    if (posts.length === 0){
                      const message = "LyddyError: No posts found."
                      const error = {code: 'POSTS_EMPTY', param: stream, message}
                      dispatch(handleFetchError(stream, error))
                    } else {
                      const sortedPosts = getSortedPosts(posts)
                      dispatch(receivePosts(stream, sortedPosts))
                    }
                },
                error => dispatch(handleFetchError(stream || 'home', error))
                )
  }
}

function getStreamUserIds(streamKey, user) {
  if (streamKey === '') {
    if (!user.isLoading && user.following) {
      const userIds = [user.uid]
      const following = Object.keys(user.following)
      return userIds.concat(following)
    }
    return null

  } else  {
    return [streamKey]
  }
}

function shouldFetchPosts(streamKey, state) {
  const posts = state.postsByStream[streamKey] || {}
  const postsEmpty = Object.keys(posts).length === 0 || posts.items.length === 0
  const postsUnavailable = posts.error && (posts.error.code === "POSTS_EMPTY")
  // console.log(posts, posts.items && posts.items.length === 0, postsUnavailable)
  // console.log(postsEmpty)
  if (postsEmpty) {
    return !postsUnavailable
  } else if (posts.isFetching) {
    return false
  } else {
    return posts.didInvalidate
  }
}

export function fetchPostsIfNeeded(streamKey) {
  return (dispatch, getState) => {
    const state = getState()
    console.log(state)
    // const posts = state.postsByStream[streamKey] || {}
    // const doFetch = shouldFetchPosts(posts) && userIds.length > 0
    const doFetch = shouldFetchPosts(streamKey, state)
    const userIds = getStreamUserIds(streamKey, state.user)
    // console.log("doFetch????????? ", userIds, doFetch)
    if (userIds && doFetch) {
      // console.log("!!!!!!! YES, FETCH...")
      // const sortedPosts = getSortedPosts(POSTS)
      // const posts = filterPostsByUser(userIds, sortedPosts)
      // dispatch(requestPosts(streamKey))
      // dispatch(receivePosts(streamKey, posts))
      // dispatch(updateQueue(posts.map(post=>post.lyd_id)))
      dispatch(fetchPosts(streamKey, userIds))
    }
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
