import { auth, usersDatabase, database } from '../Firebase';
import { updateAuthFollowing, receiveUserData, getProfilePromise } from '../actions/UserActions'
import _ from 'lodash'

export const REQUEST_SOCIALNETWORK = 'REQUEST_SOCIALNETWORK'
export const RECEIVE_SOCIALNETWORK = 'RECEIVE_SOCIALNETWORK'
export const UPDATE_SOCIALNETWORK_ITEM = 'UPDATE_SOCIALNETWORK_ITEM'
export const HANDLE_SOCIAL_ERROR = 'HANDLE_SOCIAL_ERROR'
const UNFOLLOW_CODE = 0
const FOLLOW_REQUEST_CODE = 1
const FOLLOW_CODE = 2
const BLOCK_CODE = 3

var moment = require('moment')

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

export function receiveSocialNetwork(userId, net, items) {
  return {
    type: RECEIVE_SOCIALNETWORK,
    userId,
    net,
    items,
    receivedAt: Date.now(),
  }
}
export function updateSocialNetworkItem(userId, item) {
  return {
    type: UPDATE_SOCIALNETWORK_ITEM,
    receivedAt: Date.now(),
    userId,
    item
  }
}

const isAuthenticated = userId => (auth.currentUser && (userId === auth.currentUser.uid)) || false

export function unfollowUserPromise(userId) {
  const authUserId = auth && auth.currentUser.uid
  const dbPaths = [
    `user_network/${userId}/followers/${authUserId}`,
    `user_network/${authUserId}/following/${userId}`,
    `user_network/${userId}/followers_pending/${authUserId}`,
    `user_network/${authUserId}/following_pending/${userId}`,
  ]
  const unfollowedUser = {}
  unfollowedUser[userId] = {'date_added': moment().format(), status: UNFOLLOW_CODE}
  const promises = dbPaths.map(p => database.child(p).remove())
  promises.push(mergeProfileDataPromise(unfollowedUser))
  
  return Promise.all(promises).then(data => {
    const idx = data.length-1
    console.log(data[idx])
    return data[idx]
  })
}

function updateNetTotal(userId, network, amount) {
  if (amount === 0) {
    return null
  }

  const ref = database.child(`user_network/${userId}/${network}_total`)
  ref.transaction(currentValue => {
    console.log(userId, network, amount)
    const newValue = (currentValue || 0) + amount
    console.log(currentValue || 0, newValue)
    if (newValue < 0) {
      return currentValue
    } else {
      return newValue
    }
  })
}

function incrementFollowTotal(userId) {
  const authUserId = auth.currentUser && auth.currentUser.uid
  updateNetTotal(userId, "followers", 1)
  updateNetTotal(authUserId, "following", 1)  
}

function decrementFollowTotal(userId) {
  const authUserId = auth.currentUser && auth.currentUser.uid
  updateNetTotal(userId, "followers", -1)
  updateNetTotal(authUserId, "following", -1)  
}

export function followUserPromise(userId) {
  const authUserId = auth.currentUser && auth.currentUser.uid

  return new Promise((resolve, reject) => {
    // const authUserId = auth.currentUser && auth.currentUser.uid
    if (!authUserId) {
      reject(`User authUserId not authenticated. Authenticate user first.`)
    }

    const followersRef = database.child(`user_network/${userId}/followers/${authUserId}`)
    const followingRef = database.child(`user_network/${authUserId}/following/${userId}`)
    const followersPendingRef = database.child(`user_network/${userId}/followers_pending/${authUserId}`)
    const followingPendingRef = database.child(`user_network/${authUserId}/following_pending/${userId}`)

    const value = {'date_added': moment().format(), 'status': FOLLOW_CODE}
    const newFollower = {}
    newFollower[userId] = value
    followersRef.set(value)
    .then(() => {
      followingRef.set(value, _ => {
          console.log(newFollower)
          resolve(newFollower)
        })
    })
    .catch(err=>{
      // console.log(err.code === "PERMISSION_DENIED", "pending request!...")
      value['status'] = FOLLOW_REQUEST_CODE
      followersPendingRef.set(value)
      .then(() => {
        followingPendingRef.set(value, _ => {
          console.log(newFollower)
          resolve(newFollower)
        })
      })
      .catch((err) => { reject(err.message)})
    })
  })
  .then(newFollower => {
    console.log(newFollower)
    return mergeProfileDataPromise(newFollower)
  })
}

export function performFollowAction(userId, statusCode) {
  return dispatch => {
    console.log("performing un/follow with code:", statusCode)
    var toggledFollow
    if (statusCode === UNFOLLOW_CODE) {
        toggledFollow = followUserPromise(userId)
    } else {
        toggledFollow = unfollowUserPromise(userId)
    }

    toggledFollow
    .then(followers => {
      const userData = followers && followers[userId]
      dispatch(updateStoredUserData(userData))
    })
    .catch(err => console.log(err))
  }
}

function updateStoredUserData(data) {
  return dispatch => {
    const userId = data['user_id']
    dispatch(updateAuthFollowing(userId, data))
    const isAuthUser = isAuthenticated(userId)
    dispatch(receiveUserData(userId, data, isAuthUser))
    dispatch(updateSocialNetworkItem(userId, data))
  }
}

export const getFollowStatusName = followStatus => {
  switch (followStatus) {
    case UNFOLLOW_CODE:
      return "follow"
    case FOLLOW_REQUEST_CODE:
      return "requested"
    case FOLLOW_CODE:
      return "following"
    case BLOCK_CODE:
      return "blocked"
    default:
      return "follow"
  }
}

export const getReverseFollowVerb = followStatus => {
  switch (followStatus) {
    case UNFOLLOW_CODE:
      return "follow"
    case FOLLOW_REQUEST_CODE:
      return "remove follow request"
    case FOLLOW_CODE:
      return "unfollow"
    case BLOCK_CODE:
      return "unblock"
    default:
      return ""
  }
}

export function mergeProfileDataPromise(users) {
  const userIds = Object.keys(users)
  const promises = userIds.map(userId => getProfilePromise(userId))

  const promise = Promise.all(promises).then(userDatas => {
    const usersMergedData = {}
    userDatas.forEach(userData => {
      const userId = userData['user_id']
      usersMergedData[userId] = {...userData, ...users[userId]}
    })
    return usersMergedData 
  })

  return promise
}

export function getSocialItemPromise(userId, net) {
  return new Promise((resolve, reject) => {
    database.child(`user_network/${userId}/${net}`)
    .once('value').then(snap => {
      let members = snap.val() || {}
      resolve(members)
      console.log(members)
    })
    .catch(err => reject(err.message))
  })
  .then(following => {
    return mergeProfileDataPromise(following)
  })
}

// TODO: Refactor this -- it's horribly written.
export function getSocialNetworkPromise(authUserId, userId, net, 
  mutual=false, mutualOnly=false, statusLimit=FOLLOW_CODE) {
  return new Promise((resolve, reject) => {
    let oncePromises = [database.child(`user_network/${userId}/${net}`).once('value')]
    if (statusLimit >= FOLLOW_REQUEST_CODE) {
      oncePromises.push(database.child(`user_network/${userId}/${net}_pending`).once('value'))
    }
    
    Promise.all(oncePromises)
    .then(snaps => {
      let members = {}
      snaps.forEach(snap => members = {...members, ...snap.val()})
      members = _.pickBy(members, (value, key) => value.status >= statusLimit)
      return members
    })
    .then(members => {
      if (!mutual) {
        resolve(members)
      } else {
        if (!authUserId) {
          reject(`User authUserId not authenticated. Authenticate user first.`)
        }
        const userIds = Object.keys(members)
        userIds.sort()
        // console.log(userIds)
        database.child(`user_network/${authUserId}/following`)
        .once('value').then(snap => {
          let following = snap.val() || {}
          // console.log(following)
          following = _.pickBy(following, (value, key) => userIds.includes(key))
          if (!mutualOnly) {
            userIds.forEach(userId => {
              if (following[userId] === undefined) {
                following[userId] = {status: UNFOLLOW_CODE}
              }
            })
          }
          // console.log(following)
          resolve(following)
        })
      }
    })
    .catch(err => reject(err.message))
  })
  .then(following => {
    // console.log(following)
    return mergeProfileDataPromise(following)
  })
}

export function getSocialItems(userId, net, mutual=false, mutualOnly=false, statusLimit=FOLLOW_CODE) {
  // console.log("*********** &&&& getSocialItems: ", userId, net, mutual, mutualOnly, statusLimit)
  const authUserId = auth.currentUser && auth.currentUser.uid
  return dispatch => {
    dispatch(requestSocialNetwork(`${userId}/${net}`))
    getSocialNetworkPromise(authUserId, userId, net, mutual, mutualOnly, statusLimit)
    .then(items => {
      // console.log(items)
      dispatch(receiveSocialNetwork(userId, net, items))
    })
    .catch(err => {
      // console.log(err.message)
      const error = {code: 'SOCIAL_EMPTY', param: `${userId}/${net}`, message: err.message}
      dispatch(handleFetchError(userId, error))
    })
  }
}

export function respondFollowRequest(userId, isAccepted) {
  return dispatch => {
    var followResponse
    if (isAccepted) {
      followResponse = acceptFollowRequestPromise(userId)
    } else {
      followResponse = rejectFollowRequestPromise(userId)
    }

    followResponse.then(acceptedFollower => {
      dispatch(updateStoredUserData(acceptedFollower[userId]))
    })
  }
}

export function acceptFollowRequestPromise(userId) {
  const authUserId = auth.currentUser && auth.currentUser.uid
  const val = {'date_added': moment().format(), 'status': FOLLOW_CODE}
  const followersPath = `user_network/${authUserId}/followers/${userId}`
  const followingPath = `user_network/${userId}/following/${authUserId}`
  const followersPendingPath = `user_network/${authUserId}/followers_pending/${userId}`
  const followingPendingPath = `user_network/${userId}/following_pending/${authUserId}`
  
  const updatedValues = {}
  updatedValues[followersPath] = val
  updatedValues[followingPath] = val
  updatedValues[followersPendingPath] = null
  updatedValues[followingPendingPath] = null
  
  console.log("**** accepting request!:", updatedValues)
  return database.update(updatedValues).then(_ => {
    const newFollower = {}
    newFollower[userId] = {...val, user_id: userId}
    return mergeProfileDataPromise(newFollower)
  })
}

export function rejectFollowRequestPromise(userId) {
  const authUserId = auth.currentUser && auth.currentUser.uid
  const val = {'date_added': moment().format(), 'status': UNFOLLOW_CODE}
  const dbPaths = [
    `user_network/${authUserId}/followers/${userId}`,
    `user_network/${userId}/following/${authUserId}`,
    `user_network/${authUserId}/followers_pending/${userId}`,
    `user_network/${userId}/following_pending/${authUserId}`,
  ]
  const promises = dbPaths.map(p => database.child(p).remove())
  return Promise.all(promises).then(data => {
    console.log("**** rejecting user!:", userId, dbPaths)
    console.log(data)
    const rejectedFollower = {}
    rejectedFollower[userId] = {...val, user_id: userId}
    return mergeProfileDataPromise(rejectedFollower)
  })
}
