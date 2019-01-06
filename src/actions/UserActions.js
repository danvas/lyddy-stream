import { auth, usersDatabase, database }  from '../Firebase';
import { getSocialNetworkPromise } from '../actions/SocialActions'
export const GET_USER = 'GET_USER';
export const REQUEST_USER_DATA = 'REQUEST_USER_DATA'
export const RECEIVE_USER_AUTH = 'RECEIVE_USER_AUTH';
export const RECEIVE_USER_DATA = 'RECEIVE_USER_DATA'
export const UPDATE_USER_FOLLOWING = 'UPDATE_USER_FOLLOWING'
export const RECEIVE_USER_FOLLOWING = 'RECEIVE_USER_FOLLOWING'
export const RECEIVE_ALIAS_MAPS = 'RECEIVE_ALIAS_MAPS'
export const RECEIVE_USER_STREAM = 'RECEIVE_USER_STREAM'
export const USER_REQUEST_ERROR = 'USER_REQUEST_ERROR'
export const UPDATE_ALIAS_MAPS = 'UPDATE_ALIAS_MAPS'

var moment = require('moment');


export function isLoggedIn() {
    // console.log(auth.currentUser? auth.currentUser.uid : auth.currentUser)
    return !!auth.currentUser
}


export function handleRequestError(error) {
  return {
    type: USER_REQUEST_ERROR,
    receivedAt: Date.now(),
    error
  }
}

export function updateAuthFollowing(userId, socialItem) {
    return {
        type: UPDATE_USER_FOLLOWING, 
        userId,
        socialItem
    } 
}
export function receiveAuthFollowing(following) {
    return {
        type: RECEIVE_USER_FOLLOWING, 
        following
    } 
}

export function receiveAuthData(user) {
    return {
        type: RECEIVE_USER_AUTH, 
        payload: user
    }
}

function removeFollowing(user, following) {
    const retFollowing = {...following}
    delete retFollowing[user.user_id]
    return retFollowing
}

function addFollowing(user, following) {
    const retFollowing = {...following}
    retFollowing[user.user_id] = user
    return retFollowing
}

export function updateFollowing(user, following, doFollow) {
    var modFollowing
    if (doFollow) {
        modFollowing = addFollowing(user, following)
    } else {
        modFollowing = removeFollowing(user, following)
    }
    return dispatch => dispatch(updateAuthFollowing(modFollowing))
}

export function getAuthUser() {
    // console.log("getUser!")
    return dispatch => {
        // console.log(auth.currentUser)
        dispatch(requestUserData('authentication'))
        auth.onAuthStateChanged(
            user => {
                if (user) {
                    dispatch(receiveAuthData(user))
                    let aliasToId = {}
                    aliasToId[user.displayName] = user.uid
                    // console.log(aliasToId)
                    dispatch(updateAliasMaps(aliasToId))
                    dispatch(setupAuthUser())
                } else {
                    const message = "LyddyError: User not authenticated"
                    const error = {code: 'USER_UNAUTHENTICATED', param: null, message}
                    dispatch(handleRequestError(error))
                }
            },
            error => {console.log(error)},
            () => {console.log("DECONSTRUCT AUTH SETUP HERE!!")}
        )
    }
}

export function setupAuthUser() {
    const userId = auth.currentUser && auth.currentUser.uid
    const userRef = usersDatabase.child(userId);
    return dispatch => {
        dispatch(requestUserData('setupAuthUser'))
        //// TODO: Use getProfilePromise instead!
        // getProfilePromise
        // .then(data => {
        //     dispatch(receiveUserData(userId, data, true))
        //     dispatch(getFollowing(userId))
        // })
        // .catch(error => {
        //     const message = `LyddyError: Could not find user ${userId}`
        //     const error = {code: 'USERID_NOT_FOUND', param: userId, message}
        //     dispatch(handleRequestError(error))  
        // })

        userRef.once('value').then(
            snap => {
                const userVal = snap.val()
                if (userVal === null) {
                    const message = `LyddyError: Could not find user ${userId}`
                    const error = {code: 'USERID_NOT_FOUND', param: userId, message}
                    dispatch(handleRequestError(error))  
                } else {
                    dispatch(receiveUserData(userId, userVal, true))
                    dispatch(getFollowing(userId))
                }
            },
            error => {
                dispatch(handleRequestError(error))
            }
        )
    }
}

export function getFollowing(userId) {
    return dispatch => {
      dispatch(requestUserData('getFollowing'))
      getSocialNetworkPromise(null, userId, "following", false, false, 1)
      .then(members => {
        dispatch(receiveAuthFollowing(members))
        return members
      })
      .then(members => {
        var aliasName
        let aliasToId = {}
        for (var userId in members) {
            aliasName = members[userId]['alias_name']
            aliasToId[aliasName] = userId
        }
        dispatch(updateAliasMaps(aliasToId))
      })
      .catch(err => {
        console.log(err)
        const error = {code: 'SOCIAL_EMPTY', param: `${userId}/following`, message: err.message}
        dispatch(handleRequestError(error))
      })
    }
}

function requestUserData(item) {
  return {
    type: REQUEST_USER_DATA,
    item  
  }
}

function receiveUserData(userId, userData, isAuthUser=false) {
  return {
    type: RECEIVE_USER_DATA,
    userId,
    userData,
    isAuthUser
  }
}

function updateAliasMaps(aliasToId) {
  return {
    type: UPDATE_ALIAS_MAPS,
    aliasToId
  }   
}
function receiveAliasMaps(aliasToId) {
  return {
    type: RECEIVE_ALIAS_MAPS,
    aliasToId
  }   
}

export function login(username, password) {
    return dispatch => auth.signInWithEmailAndPassword(username, password)    
}

export function logOut() {
    return dispatch => {
        dispatch(requestUserData('signout'))
        auth.signOut()
        .then(snap => {
            dispatch(receiveAuthData(snap))
        })
    }
}

export function createAccount(email, password) {
    return dispatch => auth.createUserWithEmailAndPassword(email, password);
}

export function setUser(userId, userName, userImage, bio, website, isPublic) {
    console.log(userId, userName, bio, website, isPublic)
    const userData = {
        user_id: userId,
        alias_name: userName,
        alias_image: userImage,
        bio: bio,
        website: website,
        public: isPublic
    }

    const userRef = usersDatabase.child(`${userId}`)
    // let newJobRef = userRef.push();
    userRef.set(userData);
    const aliasNames = {}
    aliasNames[userName] = userId
    database.child('alias_names').child(userName).set(userId)
    .then(z => console.log("seting alias names!!!!!!!!", z, aliasNames))
}

export function getProfilePromise(userId) {
    const dbPaths = [
      `users/${userId}`,
      `posts/${userId}`,
      `user_network/${userId}/following_total`,
      `user_network/${userId}/followers_total`,
    ]
    return Promise.all(dbPaths.map(p => database.child(p).once('value')))
    .then(data => {
        const values = data.map(snap => snap.val()) 
        const [
            user, 
            posts, 
            following_total, 
            followers_total
        ] = values

        for (const [index, value] of values.entries()) {
            if (value !== 0 && !value) {
                throw new Error(`${value} returned from database '${dbPaths[index]}'`)
            }
        }
        const posts_total = Object.keys(posts).length
        const profileData = {...user, posts_total, following_total, followers_total}
        // console.log(`querying user ${userId} data!!!: `, profileData)
        return profileData
    })
}

export function getProfile(userId) {
  return dispatch => {
    getProfilePromise.then(data => {
        dispatch(receiveUserData(userId, data, true))
    })
  }
}


export function getAliasFromProfiles(userIds) {
    var aliasNamesRef
    if (userIds.length === 0) {
        console.warn("userIds list empty:", userIds)
        return dispatch => {null}
    } else if (userIds.length === 1) {
        aliasNamesRef = usersDatabase.child(userIds[0])
    } else {
        userIds.sort()
        const firstId = userIds[0]
        const lastId = userIds[userIds.length - 1]
        // console.log(userIds, firstId, lastId)
        aliasNamesRef = usersDatabase.orderByKey().startAt(firstId).endAt(lastId)
    }

    return dispatch => {    
        dispatch(requestUserData('getAliasFromProfiles'))
        aliasNamesRef.once('value')
        .then(snap => {
            const profiles = snap.val()
            if (profiles !== null) {
                var aliasName
                let aliasToId = {}
                for (var userId in profiles) {
                    aliasName = profiles[userId]['alias_name']
                    aliasToId[aliasName] = userId
                }
                dispatch(receiveAliasMaps(aliasToId))
            } else {
                const message = `LyddyError: Could not find alias names for ${userIds}`
                const error = {code: 'ALIAS_NOT_FOUND', param: userIds, message}
                dispatch(handleRequestError(error))
            }
        })
        // .catch(error => dispatch(handleRequestError(error)))
    }
}

export function fetchUserData(userId) {
  const userRef = usersDatabase.child(userId);
  return dispatch => {
    dispatch(requestUserData('fetchUserData'))
    userRef.once('value').then(
        snap => {
            const userVal = snap.val()
            if (userVal === null) {
                const message = `LyddyError: Could not find user ${userId}`
                const error = {code: 'USERID_NOT_FOUND', param: userId, message}
                dispatch(handleRequestError(error))  
            } else {
                const {playlists, ...userData} = userVal
                var userIds = [userId]
                let aliasToId = {}
                aliasToId[userData['alias_name']] = snap.key
                dispatch(updateAliasMaps(aliasToId))
                const isAuthUser = auth.currentUser && (userId === auth.currentUser.uid)
                dispatch(receiveUserData(userId, userData, isAuthUser))
            }
        },
        error => {
            dispatch(handleRequestError(error))
        }
    )
  }
}

export function getUserDataFromAlias(aliasName) {
    const userIdRef = database.child(`alias_names/${aliasName}`);
    return dispatch => {
        dispatch(requestUserData(aliasName))
        userIdRef.once('value')
        .then(snap => {
            const userId = snap.val()
            // console.log("!!!!!!!!!!", userId)
            if (userId === null) {
                const error = {code: 'USERID_NOT_FOUND', param: aliasName, message: `User '${aliasName}' does not exist.`}
                dispatch(handleRequestError(error))
            } else {
                // console.log("USER ID!!!..",userId)
                let aliasToId = {}
                aliasToId[aliasName] = userId
                dispatch(receiveAliasMaps(aliasToId))
                dispatch(fetchUserData(userId))
            }
        }, error => console.log(error))
    }
}

export function getUserIdFromAlias(aliasName) {
    const userIdRef = database.child(`alias_names/${aliasName}`);
    return dispatch => {
        dispatch(requestUserData('getUserIdFromAlias'))
        userIdRef.once('value')
        .then(snap => {
            const userId = snap.val()
            if (userId === null) {
                const error = {code: 'USERID_NOT_FOUND', param: aliasName, message: `LyddyError: User '${aliasName}' does not exist.`}
                dispatch(handleRequestError(error))
                // throw new Error(`Alias '${aliasName}' doesn't exist`)
            } else {
                let aliasToId = {}
                aliasToId[aliasName] = userId
                dispatch(receiveAliasMaps(aliasToId))
            }
        })
    }
}


