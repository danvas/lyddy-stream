import { usersDatabase, lyddiesDatabase } from '../Firebase';
import { reset } from 'redux-form';
import { updateQueue } from './PlayerActions'

export function savePost(values) {
    return dispatch => {
        const newPostRef = lyddiesDatabase.push(values)
        newPostRef.update({lyd_id: newPostRef.key})
        dispatch(reset('NewPost'))
    }     
}

export function deletePost(id) {
    return dispatch => lyddiesDatabase.child(id).remove();
}

// For console...
/*
new Firebase("https://gimmesound-362aa.firebaseio.com").once('value', 
    function(s) { console.log(JSON.stringify(s.val())); }, console.error)
*/
