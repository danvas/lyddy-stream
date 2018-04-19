import { auth, usersDatabase }  from '../Firebase';

export const GET_USER = 'GET_USER';
export const SET_USER_DATA = 'SET_USER_DATA'
export const RECEIVE_USER_DATA = 'RECEIVE_USER_DATA'

export function getUser() {
    return dispatch => {
        auth.onAuthStateChanged(
            user => {
                dispatch({
                    type: GET_USER,
                    payload: user
                })
                if (user){
                    dispatch(fetchUserData(user.uid))
                }
                
            },
            error => {console.log(error)}
        )
    }
}

function setUserData(userData) {
  return {
    type: SET_USER_DATA,
    userData
  }
}

function receiveUserData(userData) {
  return {
    type: RECEIVE_USER_DATA,
    userData
  }
}

export function login(username, password) {
    return dispatch => auth.signInWithEmailAndPassword(username, password);
}

export function logOut() {
    return dispatch => auth.signOut();
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
    const userData = {
        alias_name: 'newguy',
        following: [""],
        followers: [""],
        playlists: {profile: [""]}            
    }
    let userRef = usersDatabase.child(`${userId}`)
    // let newJobRef = userRef.push();
    userRef.set(userData);
}

function shouldFetchUserData(state, userId) {
  const posts = state.user.uid
  return true
}

function fetchUserData(userId) {
  const userRef = usersDatabase.child(userId);
  return dispatch => {
    userRef.on('value',
        snap => dispatch(receiveUserData(snap.val())),
        error => console.log(error)
    )
  }
}

export function fetchUserDataIfNeeded(userId) {
  return (dispatch, getState) => {
    if (shouldFetchUserData(getState(), userId)) {
      return dispatch(fetchUserData(userId))
    }
  }
}
