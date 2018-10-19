import { auth, usersDatabase, lyddiesDatabase, postsDatabase, database } from '../Firebase';
import { updateQueue } from './PlayerActions'
import _ from 'lodash'
export const REQUEST_SOCIALNETWORK = 'REQUEST_SOCIALNETWORK'
export const RECEIVE_SOCIALNETWORK = 'RECEIVE_SOCIALNETWORK'
export const HANDLE_SOCIAL_ERROR = 'HANDLE_SOCIAL_ERROR'
export const SOCIAL_TOGGLE_FOLLOW = 'SOCIAL_TOGGLE_FOLLOW'
var moment = require('moment')

function getSortedPosts(followers) {
  const postValues = followers.slice()
  const sortedValues = postValues.sort((a,b) => {
    return moment(b.date_added).valueOf() - moment(a.date_added).valueOf()})
  return sortedValues
}

export function requestSocialNetwork(requested) {
  return {
    type: REQUEST_SOCIALNETWORK,
    requested
  }
}

export function handleFetchError(stream, error) {
  return {
    type: HANDLE_SOCIAL_ERROR,
    receivedAt: Date.now(),
    stream,
    error
  }
}

function filterFollowers(isPublic, followers) {
  return followers.filter(follower => (isPublic === follower.public))
}

export function receiveSocialNetwork(userId, net, items) {
  return {
    type: RECEIVE_SOCIALNETWORK,
    userId,
    net,
    items,
    receivedAt: Date.now(),
  }
}

export function unfollowUser(userId) {
    const authUserId = auth && auth.currentUser.uid
    const followersRef = database.child(`user_network/${userId}/followers/${authUserId}`)
    const followingRef = database.child(`user_network/${authUserId}/following/${userId}`)
    let val = null
    return followersRef.set(val)
    .then(() => {
      return followingRef.set(val)
    })
    .catch(err=>{
      console.log(err.code === "PERMISSION_DENIED", "pending request!...")
      return Error(err.message)
    })
}

export function doUnfollowUser(userId) {
  return dispatch => {
    dispatch(requestSocialNetwork('doFollowUser'))
    unfollowUser(userId)
  }
}

export function followUser(userId) {
    const authUserId = auth.currentUser && auth.currentUser.uid
    const followersRef = database.child(`user_network/${userId}/followers/${authUserId}`)
    const followingRef = database.child(`user_network/${authUserId}/following/${userId}`)
    let val = {'date_added': moment().format(), 'status': 1}
    return followersRef.set(val)
    .then(() => {
      return followingRef.set(val)
    })
    .catch(err=>{
      console.log(err.code === "PERMISSION_DENIED", "pending request!...")
      val['status'] = 0
      followersRef.set(val)
      .then(() => {
        return followingRef.set(val)
      })
      .catch((err) => { return Error(err.message)})
    })
}

export function toggleFollowUser(userId, doFollow) {
  return dispatch => {
    dispatch(requestSocialNetwork(`toggleFollowUser('${userId}',${doFollow})`))
    var toggledFollow 
    if (doFollow) {
      toggledFollow = followUser(userId)  
    } else {
      toggledFollow = unfollowUser(userId)
    }

    toggledFollow
    .then(() => {
      dispatch({type: SOCIAL_TOGGLE_FOLLOW, userId, toggledFollow: doFollow, success: true})
    }).catch(err => {
      dispatch({type: SOCIAL_TOGGLE_FOLLOW, userId, success: false})
    })
  }
}
export function getMutualFollow(authUserId, userId) {
  return new Promise((resolve, reject) => {
    if (!authUserId) {
      alert("Must be signed in!")
      reject(`User authUserId not authenticated. Authenticate user first.`)
    }
    database.child(`user_network/${authUserId}/following`)
    .once('value').then(snap => {
      let members = snap.val() || {}
      members = _.pickBy(members, (value, key) => value.status === 1)
      return members
    })
    .then(members => {
      const userIds = Object.keys(members)
      if (userIds.length === 0) {
        return members
      }
      userIds.sort()
      const firstId = userIds[0]
      const lastId = userIds[userIds.length - 1]
      database.child(`user_network/${userId}/followers`)
      .orderByKey().startAt(firstId).endAt(lastId)
      .once('value').then(snap => {
        let followers = snap.val() || {}
        followers = _.pickBy(followers, (value, key) => {
          return userIds.includes(key) && (value.status === 1)
        })
        resolve(followers)
      })
    })
    .catch(err => reject(err.message))
  })
}

export function getSocialNetworkPromise(userId, net, 
  filterByStatus=1, mergeProfileData=true) {
  return new Promise((resolve, reject) => {
    database.child(`user_network/${userId}/${net}`)
    .once('value').then(snap => {
      let members = snap.val() || {}
      console.log(members)
      if (filterByStatus !== undefined) {
        members = _.pickBy(members, 
          (value, key) => filterByStatus === value.status)
      }
      resolve(members)
    })
    .catch(dbError => {
      reject(new Error(dbError.message))
    })

  }).then(members => {
    if (mergeProfileData) {
      return mergeProfileDataPromise(members)
    } else {
      return members
    }
  })
}

export function mergeProfileDataPromise(users) {
  return new Promise((resolve, reject) => {
    let userIds = Object.keys(users)
    if (userIds.length === 0) {
      resolve(users)
    }
    userIds.sort()
    const firstId = userIds[0]
    const lastId = userIds[userIds.length - 1]
    usersDatabase.orderByKey().startAt(firstId).endAt(lastId)
    .once('value').then(snap => {
      let items = {}
      var item
      snap.forEach(userSnap => {
        const profile = userSnap.val()
        const member = users[userSnap.key] || null
        if (member !== null) {
          item = {...member, ...profile,
            user_id: userSnap.key
          }
          items[userSnap.key] = item
        }
      })
      resolve(items)
    })
    .catch(dbError => {
      reject(new Error(dbError.message))
    })
  })
}

export function getSocialNetwork(userId, net) {
    return dispatch => {
      dispatch(requestSocialNetwork(`${userId}/${net}`))
      getSocialNetworkPromise(userId, net)
      .then(items => {
        console.log(items)
        dispatch(receiveSocialNetwork(userId, net, items))
      })
      .catch(err => {
        console.log(err.message)
        const error = {code: 'SOCIAL_EMPTY', param: `${userId}/${net}`, message: err.message}
        dispatch(handleFetchError(userId, error))
      })
    }
}

export function acceptFollower(userId) {
    const authUserId = auth.currentUser && auth.currentUser.uid
    if (authUserId === undefined) {
      console.log("ERROR! Must be signed in to follow peeps!")
      return
    }
    if (userId === authUserId) {
      console.log("ERROR! Cannot accept thyself.")
      return
    }
    const ref = database.child(`user_network/${authUserId}/followers/${userId}`)
    const followingRef = database.child(`user_network/${userId}/following/${authUserId}`)
    const val = {'date_added': moment().format(), 'status': 1}
    ref.update(val, (something)=>{
        console.log(`accepted follower '${userId}'!!`, something)
        followingRef.set(val)
    })
    .catch(error=>console.log(error))
}


