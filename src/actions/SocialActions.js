import { auth, usersDatabase, database } from '../Firebase';
import { updateAuthFollowing } from '../actions/UserActions'
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

export function unfollowUserPromise(userId) {
  const authUserId = auth && auth.currentUser.uid
  return new Promise((resolve, reject) => {
    const followersRef = database.child(`user_network/${userId}/followers/${authUserId}`)
    const followingRef = database.child(`user_network/${authUserId}/following/${userId}`)
    followersRef.set(null)
    .then(() => {
      const unfollowedUsers = {}
      unfollowedUsers[userId] = {user_id: userId, status: UNFOLLOW_CODE}
      followingRef.set(null, _ => {
        resolve(unfollowedUsers)
      })
    })
    .catch(err=>{
      // console.log("UNFOLLOW didn't work!!!!!! ", err.code)
      reject(err.message)
    })     
  })
    .then(unfollowed => {
    // console.log(newFollower)
    return mergeProfileDataPromise(unfollowed)
  })
}

function updateNetTotal(userId, network, amount) {
  if (amount === 0) {
    return null
  }

  const ref = database.child(`user_network/${userId}/${network}_total`)
  ref.transaction(currentValue => {
    const newValue = currentValue + amount
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
    const newFollower = {}
    const val = {'date_added': moment().format(), 'status': FOLLOW_CODE}

    followersRef.set(val)
    .then(() => {
      newFollower[userId] = val
      console.log(newFollower)
      followingRef.set(val, _ => {
          incrementFollowTotal(userId)
          resolve(newFollower)
        })
    })
    .catch(err=>{
      // console.log(err.code === "PERMISSION_DENIED", "pending request!...")
      val['status'] = FOLLOW_REQUEST_CODE
      followersRef.set(val)
      .then(() => {
        newFollower[userId] = val
        followingRef.set(val, _ => {
          resolve(newFollower)
        })
      })
      .catch((err) => { reject(err.message)})
    })
  })
  .then(newFollower => {
    // console.log(newFollower)
    return mergeProfileDataPromise(newFollower)
  })
}

export function performFollowAction(userId, statusCode) {
  return dispatch => {
    var toggledFollow
    if (statusCode === UNFOLLOW_CODE) {
        toggledFollow = followUserPromise(userId)
    } else if (statusCode === FOLLOW_REQUEST_CODE) {
        toggledFollow = unfollowUserPromise(userId)
    } else {
        toggledFollow = unfollowUserPromise(userId)
                        .then(followers => {
                          decrementFollowTotal(userId)
                          return followers
                        })
    }

    toggledFollow
    .then(followers => {
      const socialItem = followers && followers[userId]
      // console.log(socialItem)
      dispatch(updateAuthFollowing(userId, socialItem))
      dispatch(updateSocialNetworkItem(userId, socialItem))
    })
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
      snap.forEach(userSnap => {
        const profile = userSnap.val()
        const member = users[userSnap.key] || null
        if (member !== null) {
          items[userSnap.key] = {...member, ...profile}
        }
      })
      resolve(items)
    })
    .catch(dbError => {
      reject(new Error(dbError.message))
    })
  })
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

export function getSocialNetworkPromise(authUserId, userId, net, 
  mutual=false, mutualOnly=false, statusLimit=FOLLOW_CODE) {
  return new Promise((resolve, reject) => {
    database.child(`user_network/${userId}/${net}`)
    .once('value').then(snap => {
      let members = snap.val() || {}
      // console.log(members)
      members = _.pickBy(members, (value, key) => value.status >= statusLimit)
      // console.log(members)
      return members
    })
    .then(members => {
      if (!mutual) {
        // console.log("$$$$ FORGET MUTUALS!", members)
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

export function acceptFollowRequest(userId) {
    updateFollowStatus(userId, FOLLOW_CODE)
    .then(newFollower => {
      console.log("accepting follower!!!", newFollower)
    })
}

export function rejectFollowRequest(userId) {
    updateFollowStatus(userId, UNFOLLOW_CODE)
    .then(newFollower => {
      console.log("rejecting follower!!!", newFollower)
    })
    .catch(err => console.log(err))
}

function updateFollowStatus(userId, statusCode) {
  return new Promise((resolve, reject) => {
    const authUserId = auth.currentUser && auth.currentUser.uid
    const updateTotals = () => {
      const amount = (FOLLOW_CODE === statusCode)? 1 : 0
      updateNetTotal(authUserId, "followers", amount)
      updateNetTotal(userId, "following", amount)  
    }

    const val = {'date_added': moment().format(), 'status': statusCode}
    const dbVal = (statusCode === UNFOLLOW_CODE)? null : val
    const updatedValues = {}
    updatedValues[`user_network/${authUserId}/followers/${userId}`] = dbVal
    updatedValues[`user_network/${userId}/following/${authUserId}`] = dbVal

    database.update(updatedValues, updateTotals)
    .then(_ => {
      const newFollower = {}
      newFollower[userId] = {...val, user_id: userId}
      resolve(newFollower)
    })
    .catch(err => reject(new Error(err.message)))
  })
}


