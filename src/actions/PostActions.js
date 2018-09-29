import { auth, usersDatabase, lyddiesDatabase, database } from '../Firebase';
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


export function updateAllPrivacy(userId, isPublic) {
    const privPub = isPublic? 'PUBLIC':'PRIVATE'
    console.log(`!!!!!!!!!! MAKE ${privPub} : `, userId)
    const userPosts = lyddiesDatabase.orderByChild('user_id').equalTo(userId)

    console.log(userPosts)
    let posts = {}
    userPosts.once('value')
        .then(snap => snap.forEach(
                         dat => {
                            console.log(dat.key)
                            lyddiesDatabase.child(dat.key).update({'public': isPublic}, 
                                res => console.log(res))
                         }
                      )
             )
}


export function deletePost(id) {
    return dispatch => lyddiesDatabase.child(id).remove();
}

// For console...
/*
new Firebase("https://gimmesound-362aa.firebaseio.com").once('value', 
    function(s) { console.log(JSON.stringify(s.val())); }, console.error)
*/
