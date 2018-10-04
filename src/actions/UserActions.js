import { auth, usersDatabase, database }  from '../Firebase';
import { handleFetchError } from '../actions'
export const GET_USER = 'GET_USER';
export const REQUEST_USER_DATA = 'REQUEST_USER_DATA'
export const RECEIVE_USER_DATA = 'RECEIVE_USER_DATA'
export const RECEIVE_USER_STREAM = 'RECEIVE_USER_STREAM'
export const USER_REQUEST_ERROR = 'USER_REQUEST_ERROR'
export const UPDATE_ALIAS_MAPS = 'UPDATE_ALIAS_MAPS'

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

export function getUser() {
    // console.log("getUser!")
    return dispatch => {
        // console.log(auth.currentUser)
        dispatch(requestUserData('authentication'))
        auth.onAuthStateChanged(
            user => {
                if (user) {
                    dispatch({type: GET_USER, payload: user})
                    dispatch(fetchUserData(user.uid))
                } else {
                    const message = "LyddyError: User not authenticated"
                    const error = {code: 'USER_UNAUTHENTICATED', param: null, message}
                    dispatch(handleRequestError(error))
                }
            },
            error => {console.log(error)}
        )
    }
}

function requestUserData(item) {
  return {
    type: REQUEST_USER_DATA,
    item  
  }
}
function receiveUserData(userId, userData) {
  const authUserId = auth.currentUser && auth.currentUser.uid
  return {
    type: RECEIVE_USER_DATA,
    authUserId,
    userId,
    userData,
  }
}
function receiveUserPlaylists(userId, streams) {
  return {
    type: RECEIVE_USER_STREAM,
    userId,
    streams
  }
}

function updateAliasMaps(aliasToId) {
  return {
    type: UPDATE_ALIAS_MAPS,
    aliasToId,
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
            dispatch({type: GET_USER, payload: snap})
        })
    }
}

export function createAccount(email, password) {
    return dispatch => auth.createUserWithEmailAndPassword(email, password);
}

export function setUser(userId) {
    // const newMessageRef = usersDatabase.push();
    // newMessageRef.set({
    //   'user_id': 'ada',
    //   'text': 'The Analytical Engine weaves algebraical patterns just as the Jacquard loom weaves flowers and leaves.'
    // });
    let playlists = {}
    playlists[userId] = [""]
    
    const userData = {
        alias_name: 'newguy',
        following: {},
        followers: {},
        playlists       
    }
    let userRef = usersDatabase.child(`${userId}`)
    // let newJobRef = userRef.push();
    userRef.set(userData);
}


export function getAliasFromProfiles(userIds) {
    const firstId = userIds[0]
    const lastId = firstId//userIds[userIds.length - 1]
    // console.log(userIds, firstId, lastId)
    const aliasNamesRef = usersDatabase.orderByKey().startAt(firstId)//.endAt(lastId)
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
                dispatch(updateAliasMaps(aliasToId))
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
                const error = {code: 'USER_NOT_FOUND', param: userId, message}
                dispatch(handleRequestError(error))  
            } else {
                const {playlists, ...userData} = userVal
                var userIds = [userId]
                var userIds = userIds.concat(Object.keys(userData['follows']))
                dispatch(getAliasFromProfiles(userIds.sort()))
                dispatch(receiveUserData(userId, userData))
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
            console.log(userId)
            if (userId === null) {
                const error = {code: 'USERID_NOT_FOUND', param: aliasName, message: `User '${aliasName}' does not exist.`}
                dispatch(handleRequestError(error))
            } else {
                console.log("USER ID!!!..",userId) 
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
                dispatch(updateAliasMaps(aliasToId))
            }
        })
    }
}

