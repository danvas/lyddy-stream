import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { playerReducer } from './PlayerReducer';
import UserReducer from './UserReducer'

import {
  SELECT_USER,
  REQUEST_SOCIALNETWORK,
  RECEIVE_SOCIALNETWORK,
  UPDATE_SOCIALNETWORK_ITEM,
  HANDLE_SOCIAL_ERROR,
} from '../actions/SocialActions'

const defState = {
    isFetching: false,
    userNetworkDbCallStack: [],
    items: {}
  }

export default function(state=defState, action) {
  var userNetworkDbCallStack
  if (action.type === REQUEST_SOCIALNETWORK) {
      userNetworkDbCallStack = [...state.userNetworkDbCallStack, action.requested]
  } else {
      userNetworkDbCallStack = state.userNetworkDbCallStack.slice(0, state.userNetworkDbCallStack.length - 1)
  }
  const isFetching = userNetworkDbCallStack.length > 0 

  switch (action.type) {
    case HANDLE_SOCIAL_ERROR:
      return {...state, 
        items: {},
        error: action.error,
        isFetching,
        userNetworkDbCallStack
      }
    case REQUEST_SOCIALNETWORK:
      return {...state,
        userNetworkDbCallStack,
        isFetching
      }
    case RECEIVE_SOCIALNETWORK:
      return {...state,
        net: action.net,
        items: action.items,
        lastUpdated: action.receivedAt,
        userNetworkDbCallStack,
        isFetching
      }    
    case UPDATE_SOCIALNETWORK_ITEM:
      const items = {...state.items}
      items[action.userId] = {...action.item}
      return {...state,
        lastUpdated: action.receivedAt,
        items,
      }
    default:
      return state
  }
}