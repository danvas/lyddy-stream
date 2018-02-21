import { postsDatabase } from '../Firebase';
export const FETCH_POSTS = 'fetch_posts';

export function fetchPosts() {
    return dispatch => {
        postsDatabase.on('value', snap => {
            dispatch({
                type: FETCH_POSTS,
                payload: snap.val()
            })
        })
    }
}

export function savePost(values) {
    return dispatch => postsDatabase.push(values);
}

export function deletePost(id) {
    return dispatch => postsDatabase.child(id).remove();
}