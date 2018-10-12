import { auth, usersDatabase, lyddiesDatabase, postsDatabase, database } from '../Firebase';
import { updateQueue } from './PlayerActions'
export const REQUEST_SOCIALNETWORK = 'REQUEST_SOCIALNETWORK'
export const RECEIVE_SOCIALNETWORK = 'RECEIVE_SOCIALNETWORK'
export const HANDLE_SOCIAL_ERROR = 'HANDLE_SOCIAL_ERROR'
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

export function receiveSocialNetwork(userId, items) {
  return {
    type: RECEIVE_SOCIALNETWORK,
    userId,
    items,
    receivedAt: Date.now(),
  }
}



export function unfollowUser(userId) { //WIP
    const authUserId = auth.currentUser && auth.currentUser.uid
    const followRef = database.child(`user_network/${userId}/followers/${authUserId}`)
    // let val = {'date_added': moment().format(), 'status': 1}
    // followRef.set(val, ()=>console.log("followUser done!!!", userId))
    // .then(something=>console.log("something in then!", something))
    // .catch(err=>{
    //         console.log(err.code === "PERMISSION_DENIED", "pending request!...")
    //         val['status'] = 0
    //         followRef.set(val)
    // })
}

export function followUser(userId) {
    const authUserId = auth.currentUser && auth.currentUser.uid
    const followersRef = database.child(`user_network/${userId}/followers/${authUserId}`)
    const followingRef = database.child(`user_network/${authUserId}/following/${userId}`)
    let val = {'date_added': moment().format(), 'status': 1}
    followersRef.set(val)
    .then(() => {
      followingRef.set(val)
    })
    .catch(err=>{
      console.log(err.code === "PERMISSION_DENIED", "pending request!...")
      val['status'] = 0
      followersRef.set(val)
      followingRef.set(val)
    })
}

export function getSocialNetworkPromise(userId, net, mergeProfileData=true) {
  return new Promise((resolve, reject) => {
    database.child(`user_network/${userId}/${net}`)
    .once('value').then(snap => {
      const members = snap.val()
      console.log(members)
      if (members === null){
        reject(new Error(`LyddyError: '${net}' data not found.`))
      } else {
        console.log(members)
        resolve(members)
      }
    })
    .catch(dbError => {
      reject(new Error(dbError.message))
    })

  }).then(members => {
    if (!mergeProfileData) {
      return members
    } else {
      return new Promise((resolve, reject) => {
        let memberIds = Object.keys(members)
        memberIds.sort()
        const firstId = memberIds[0]
        const lastId = memberIds[memberIds.length - 1]
        usersDatabase.orderByKey().startAt(firstId).endAt(lastId)
        .once('value').then(snap => {
          let items = {}
          var item
          snap.forEach(userSnap => {
            const user = userSnap.val()
            const member = members[userSnap.key] || null
            if (member !== null) {
              item = {...member,
                user_alias: user['alias_name'],
                user_image: user['alias_image'],
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
  })
}

export function getSocialNetwork(userId, net) {
    return dispatch => {
      dispatch(requestSocialNetwork(`${userId}/${net}`))
      getSocialNetworkPromise(userId, net)
      .then(items => {
        console.log(items)
        dispatch(receiveSocialNetwork(userId, items))
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


