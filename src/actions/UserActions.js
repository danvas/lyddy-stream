import { auth }  from '../Firebase';

export const GET_USER = 'GET_USER';

export function getUser() {
    return dispatch => {
        auth.onAuthStateChanged(user => {
            dispatch({
                type: GET_USER,
                payload: user
            })
        })
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