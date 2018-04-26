import { auth, usersDatabase, lyddiesDatabase } from '../Firebase';
import { reset } from 'redux-form';
import { updateQueue } from './PlayerActions'

export function pushToPlaylist(lydId, index, playlistId) {
    const userId = auth.currentUser.uid
    const playlistsRef = usersDatabase.child(`${userId}/playlists`)
    let playlistRef = null
    return dispatch => {
        if (playlistId === undefined && index === undefined) {
            playlistRef = playlistsRef.child(playlistId)
            playlistRef.push({lyd_id: lydId, index})
        } 

        playlistRef = playlistsRef.child(userId)
        playlistRef.push({lyd_id: lydId, index: -1})
    }     
}

export function savePost(values) {
    return dispatch => {
        const newPostRef = lyddiesDatabase.push(values)
        newPostRef.update({lyd_id: newPostRef.key})
        dispatch(reset('NewPost'))
        console.log(auth.currentUser)
        dispatch(pushToPlaylist(newPostRef.key))
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
