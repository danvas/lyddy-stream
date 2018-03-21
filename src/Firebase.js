import * as firebase from 'firebase'


// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDQElxVFEjAxD5vr9Fd6T7H6Cwdj1NdwSE",
  authDomain: "gimmesound-362aa.firebaseapp.com",
  databaseURL: "https://gimmesound-362aa.firebaseio.com",
  projectId: "gimmesound-362aa",
  storageBucket: "gimmesound-362aa.appspot.com",
  messagingSenderId: "465797713734"
};



// export const provider = new firebase.auth.GoogleAuthProvider();
// export const auth = firebase.auth(); 

const firebaseApp = firebase.initializeApp(firebaseConfig)
export const database = firebaseApp.database().ref()
export const postsDatabase = database.child('posts')
export const usersDatabase = database.child('users')
export const lyddiesDatabase = database.child('lyddies');
