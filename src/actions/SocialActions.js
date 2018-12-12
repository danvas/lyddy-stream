import { auth, usersDatabase, lyddiesDatabase, postsDatabase, database } from '../Firebase';
import { updateQueue } from './PlayerActions'
import { updateAuthFollowing } from '../actions/UserActions'
import _ from 'lodash'
export const REQUEST_SOCIALNETWORK = 'REQUEST_SOCIALNETWORK'
export const RECEIVE_SOCIALNETWORK = 'RECEIVE_SOCIALNETWORK'
export const HANDLE_SOCIAL_ERROR = 'HANDLE_SOCIAL_ERROR'
export const SOCIAL_TOGGLE_FOLLOW = 'SOCIAL_TOGGLE_FOLLOW'
const UNFOLLOW_CODE = 0
const FOLLOW_REQUEST_CODE = 1
const FOLLOW_CODE = 2
const BLOCK_CODE = 3
export const FOLLOW_STATUS_CODES = ['unfollow', 'request', 'follow', 'block']

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

export function unfollowUserPromise(userId) {
  const authUserId = auth && auth.currentUser.uid
  return new Promise((resolve, reject) => {
    const followersRef = database.child(`user_network/${userId}/followers/${authUserId}`)
    const followingRef = database.child(`user_network/${authUserId}/following/${userId}`)
    followersRef.set(null)
    .then(() => {
      followingRef.set(null, resolve(null))
    })
    .catch(err=>{
      // console.log("UNFOLLOW didn't work!!!!!! ", err.code)
      reject(err.message)
    })     
  })
}

export function doUnfollowUser(userId) {
  return dispatch => {
    dispatch(requestSocialNetwork('doFollowUser'))
    // unfollowUser(userId)
  }
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
    let val = {'date_added': moment().format(), 'status': FOLLOW_CODE}

    followersRef.set(val)
    .then(() => {
      newFollower[userId] = val
      // console.log(newFollower)
      followingRef.set(val, resolve(newFollower))
    })
    .catch(err=>{
      // console.log(err.code === "PERMISSION_DENIED", "pending request!...")
      val['status'] = FOLLOW_REQUEST_CODE
      followersRef.set(val)
      .then(() => {
        newFollower[userId] = val
        // console.log(newFollower)
        followingRef.set(val, resolve(newFollower))
      })
      .catch((err) => { reject(err.message)})
    })
  })
  .then(newFollower => {
    // console.log(newFollower)
    return mergeProfileDataPromise(newFollower)
  })
}
export function followUser(userId) {
  const authUserId = auth.currentUser && auth.currentUser.uid
  return followUserPromise
}

export function performFollowAction(userId, doFollow) {
  return dispatch => {
    var toggledFollow 
    if (doFollow) {
      toggledFollow = followUserPromise(userId)  
    } else {
      toggledFollow = unfollowUserPromise(userId)
    }

    toggledFollow
    .then(followers => {
      const socialItem = followers && followers[userId]
      dispatch(updateAuthFollowing(userId, socialItem))
      dispatch({type: SOCIAL_TOGGLE_FOLLOW, userId, toggledFollow: doFollow, success: true})
    }).catch(err => {
      dispatch({type: SOCIAL_TOGGLE_FOLLOW, userId, success: false})
    })
  }
}

export const getFollowToggle = followStatus => !followStatus

export function toggleFollowUser(userId, doFollow) {
  return dispatch => {
    dispatch(requestSocialNetwork(`toggleFollowUser('${userId}',${doFollow})`))
    var toggledFollow 
    if (doFollow) {
      toggledFollow = followUserPromise(userId)  
    } else {
      toggledFollow = unfollowUserPromise(userId)
    }

    toggledFollow
    .then(() => {
      dispatch({type: SOCIAL_TOGGLE_FOLLOW, userId, toggledFollow: doFollow, success: true})
    }).catch(err => {
      dispatch({type: SOCIAL_TOGGLE_FOLLOW, userId, success: false})
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

export function getMutualFollow(userId) {
  const authUserId = auth.currentUser && auth.currentUser.uid
  // console.log(authUserId)
  return dispatch => {
    dispatch(requestSocialNetwork(`getMutualFollow('${userId}')`))
    getMutualFollowPromise(authUserId, userId)
    .then(items => {
      // console.log(items)
      dispatch(receiveSocialNetwork(userId, "mutual", items))
    })
    .catch(err => {
      // console.log(err)
      // const error = {code: 'SOCIAL_EMPTY', param: `${userId}/${net}`, message: err.message}
      // dispatch(handleFetchError(userId, error))
    })
  }
}

export function getMutualFollowPromise(authUserId, userId) {
  return new Promise((resolve, reject) => {
    if (!authUserId) {
      reject(`User authUserId not authenticated. Authenticate user first.`)
    }
    database.child(`user_network/${authUserId}/following`)
    .once('value').then(snap => {
      let members = snap.val() || {}
      // console.log(members)
      members = _.pickBy(members, (value, key) => value.status === FOLLOW_CODE)
      return members
    })
    .then(members => {
      const userIds = Object.keys(members)//.concat(authUserId) // TODO: Include auth user?
      userIds.sort()
      const firstId = userIds[0]
      const lastId = userIds[userIds.length - 1]
      // console.log(userIds)
      // console.log(firstId)
      // console.log(lastId)
      database.child(`user_network/${userId}/followers`)
      .orderByKey().startAt(firstId).endAt(lastId)
      .once('value').then(snap => {
        let followers = snap.val() || {}
        followers = _.pickBy(followers, (value, key) => {
          return userIds.includes(key) && (value.status === FOLLOW_CODE)
        })
        resolve(followers)
      })
    })
    .catch(err => reject(err.message))
  })
  .then(followers => {
    return mergeProfileDataPromise(followers)
  })
}
// Could I add a `mutualFirst` parameter here 
// instead of having a separate `getMutualFollowPromise`??
export function getSocialNetworkPromise(userId, net, 
  filterByStatus=FOLLOW_CODE, mergeProfileData=true, mutualFirst=false) {
  return new Promise((resolve, reject) => {
    database.child(`user_network/${userId}/${net}`)
    .once('value').then(snap => {
      let members = snap.val() || {}
      // console.log(members)
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

// pick
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
            user_id: userSnap.key // TODO: Move this to intial user creation function
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

export function getSocialNetworkPromise2(authUserId, userId, net, 
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
    getSocialNetworkPromise2(authUserId, userId, net, mutual, mutualOnly, statusLimit)
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

export function acceptFollower(userId) {
    const authUserId = auth.currentUser && auth.currentUser.uid
    if (authUserId === undefined) {
      // console.log("ERROR! Must be signed in to follow peeps!")
      return
    }
    if (userId === authUserId) {
      // console.log("ERROR! Cannot accept thyself.")
      return
    }
    const ref = database.child(`user_network/${authUserId}/followers/${userId}`)
    const followingRef = database.child(`user_network/${userId}/following/${authUserId}`)
    const val = {'date_added': moment().format(), 'status': FOLLOW_CODE}
    ref.update(val, () => {
        // console.log(`accepted follower '${userId}'!!`)
        followingRef.set(val)
    })
    .catch(error=>console.log(error))
}


