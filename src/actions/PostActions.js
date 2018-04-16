import { usersDatabase, lyddiesDatabase } from '../Firebase';
import { updateQueue } from './PlayerActions'
import _ from 'lodash';
export const FETCH_POSTS = 'fetch_posts';

const CURRENT_USER_ID = "F7G80ZQ0QffjiWtHT51tU8ztHRq1"

export function fetchPosts(userId) {
  // Thunk middleware knows how to handle functions.
  // It passes the dispatch method as an argument to the function,
  // thus making it able to dispatch actions itself.
 
  return dispatch => {
    // First dispatch: the app state is updated to inform
    // that the API call is starting.
    // dispatch(requestPosts(subreddit))
    // console.log("requestPosts(subreddit)...")
    lyddiesDatabase.on('value', 
                        snap => {

                            const posts = getPublicLyds(snap.val(), CURRENT_USER_ID) 

                            dispatch({
                                type: FETCH_POSTS,
                                payload: posts
                            });
                            dispatch(updateQueue(Object.keys(posts).reverse()))
                            // dispatch({
                            //     type: 'update_queue',
                            //     queuedIds: Object.keys(posts)
                            // })
                            // Here, we update the app state with the results of the API call.
                            // dispatch(receivePosts(subreddit, json))
                            console.log("receivePosts(subreddit, json)...")
                        },
                        error => console.log('An error occurred.', error)
                        );
    }
}
/*NOTE on on
/*
var ref = firebase.database().ref("users/ada");
ref.once("value")
  .then( snap => {
    var key = snap.key; // "ada"
    var childKey = snap.child("name/last").key; // "last"
  });
*/
export function savePost(values) {
    return dispatch => lyddiesDatabase.push(values); //FIXME: Must update queuedIds with new id!!        
}

export function deletePost(id) {
    return dispatch => lyddiesDatabase.child(id).remove();
}

export function getPublicLyds(posts, user) {
    return _.pickBy(posts, 
        post => post.public);
}
// For console...
/*
new Firebase("https://gimmesound-362aa.firebaseio.com").once('value', 
    function(s) { console.log(JSON.stringify(s.val())); }, console.error)
*/
