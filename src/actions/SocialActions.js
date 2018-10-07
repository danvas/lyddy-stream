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

export function requestSocialMembers(requested) {
  return {
    type: REQUEST_SOCIALNETWORK,
    requested
  }
}

export function handleFetchError(stream, error) {
  return {
    type: HANDLE_SOCIAL_ERROR,
    stream,
    followers: [],
    receivedAt: Date.now(),
    error
  }
}

function filterFollowers(isPublic, followers) {
  return followers.filter(follower => (isPublic === follower.public))
}

export function receiveSocialMembers(userId, items) {
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



export function getSocialNetwork(userId, net) {
    const reqRef = database.child(`user_network/${userId}/${net}`)
    return (dispatch, getState) => {
      console.log(getState())
      dispatch(requestSocialMembers(`${userId}/${net}`))
      reqRef.once('value')
      .then(snap => {
        const members = snap.val()
        console.log(members)
        if (members === null){
          throw Error(`LyddyError: '${net}' list is empty.`)
        } else {
          return members
        }
      })
      .then(members => {
        let memberIds = Object.keys(members)
        // console.log(memberIds)
        memberIds.sort()
        // console.log(memberIds)
        const firstId = memberIds[0]
        const lastId = memberIds[memberIds.length - 1]
        usersDatabase.orderByKey().startAt(firstId).endAt(lastId)
        .once('value').then(snap => {
          var item
          let items = []
          // console.log(snap.val())
          snap.forEach(userSnap => {
            const user = userSnap.val()
            // console.log(userSnap.key, user['alias_name'])
            // console.log(memberIds.includes(userSnap.key))
            if (memberIds.includes(userSnap.key)) {
              item = {...members[userSnap.key],
                user_id: userSnap.key,
                user_alias: user['alias_name'],
                user_image: user['alias_image'],
              }
              // console.log(item)
              items.push(item)
            }
          })
          console.log(items)
          dispatch(receiveSocialMembers(userId, items))
        })
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


