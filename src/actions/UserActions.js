import { auth, usersDatabase, database }  from '../Firebase';
import { handleFetchError } from '../actions'
export const GET_USER = 'GET_USER';
export const REQUEST_USER_DATA = 'REQUEST_USER_DATA'
export const RECEIVE_USER_DATA = 'RECEIVE_USER_DATA'
export const RECEIVE_USER_STREAM = 'RECEIVE_USER_STREAM'
export const USER_REQUEST_ERROR = 'USER_REQUEST_ERROR'
export const UPDATE_ALIAS_MAP = 'UPDATE_ALIAS_MAP'

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
                // console.log("dispatching GET_USER! ", user)
                dispatch({type: GET_USER, payload: user})     
            },
            error => {console.log(error)}
        )
    }
}

function requestUserData(userKey) {
  return {
    type: REQUEST_USER_DATA,
    userKey  
  }
}
function receiveUserData(userId, userData) {
  return {
    type: RECEIVE_USER_DATA,
    userId,
    userData
  }
}
function receiveUserPlaylists(userId, streams) {
  return {
    type: RECEIVE_USER_STREAM,
    userId,
    streams
  }
}

function updateAliasMap(alias, userId) {
  return {
    type: UPDATE_ALIAS_MAP,
    alias,
    userId
  }   
}

export function login(username, password) {
    return dispatch => auth.signInWithEmailAndPassword(username, password)    
}

export function logOut() {
    console.log("trying logOut... auth.currentUser: ", auth.currentUser)
    return dispatch => {
        dispatch(requestUserData('signout'))
        auth.signOut()
        .then(snap => {
            console.log("logged out!", snap)
            dispatch({type: GET_USER, payload: snap})
        })
        .catch(err => console.log("error loggin out??:", err))
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

export function fetchUserData(userId) {
  const userRef = usersDatabase.child(userId);
  return dispatch => {
    dispatch(requestUserData(userId))
    userRef.once('value').then(
        snap => {
            const {playlists, ...userData} = snap.val()
            dispatch(updateAliasMap(userData.alias_name, userId))
            dispatch(receiveUserPlaylists(userId, playlists))
            dispatch(receiveUserData(userId, userData))
        },
        error => {
            dispatch(handleRequestError(error))
        }
    )
  }
}

export function toUserId(aliasName) {
  const userIdRef = database.child(`alias_names/${aliasName}`);
  return userIdRef.once('value')
}

export function ctoUserId(aliasName) {
    const userIdRef = database.child(`alias_names/${aliasName}`);
    console.log(aliasName)
    return dispatch => {
        dispatch(requestUserData(aliasName))
        userIdRef.once('value').then(
            snap => { 
                const val = snap.val()
                console.log(val)
                dispatch(updateAliasMap(aliasName, val))
            },
            error => {
                dispatch(handleRequestError(error))
            }
        )
    }
}

// export function getUserProfile(userId) {
//   const userRef = usersDatabase.child(userId);
//   return userRef.once('value')
// }
