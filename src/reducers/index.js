import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { playerReducer } from './PlayerReducer';
import UserReducer from './UserReducer'

import {
  SELECT_STREAM,
  INVALIDATE_STREAM,
  REQUEST_LYD_POSTS,
  REQUEST_POSTS,
  RECEIVE_LYD_POSTS,
  RECEIVE_POSTS,
  HANDLE_FETCH_ERROR
} from '../actions'

function selectedStream(state='', action) {
  switch (action.type) {
    case SELECT_STREAM:
      return action.stream
    default:
      return state
  }
}

function posts(
  state = {
    isFetching: false,
    didInvalidate: false,
    items: []
  }, action) {
  switch (action.type) {
    case HANDLE_FETCH_ERROR:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        items: []
      })
    case INVALIDATE_STREAM:
      return Object.assign({}, state, {
        didInvalidate: true
      })
    case REQUEST_POSTS:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false
      })
    case RECEIVE_POSTS:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        items: action.posts,
        lastUpdated: action.receivedAt
      })
    default:
      return state
  }
}

function postsByStream(state = {}, action) {
  switch (action.type) {
    case HANDLE_FETCH_ERROR:
    case INVALIDATE_STREAM:
    case RECEIVE_POSTS:
    case REQUEST_POSTS:
      return Object.assign({}, state, {
        [action.stream]: posts(state[action.stream], action)
      })
    default:
      return state
  }
}

const rootReducer = combineReducers({
    form: formReducer,
    player: playerReducer,
    user: UserReducer,
    postsByStream,
    selectedStream
})

export default rootReducer;