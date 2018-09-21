
import { 
    REQUEST_USER_DATA,
    UPDATE_ALIAS_MAP,
    USER_REQUEST_ERROR,
    GET_USER, 
    RECEIVE_USER_DATA,
    RECEIVE_USER_STREAM
} from '../actions/UserActions';

export default function(state={isLoading: false, loggedIn: false, 
    profiles: {}, streams: {}, aliasMap: {}, error: {}}, action) {
    // console.log(action.userData)
    // console.log(state, action.payload)
    switch (action.type) {
        case REQUEST_USER_DATA:
            return {...state, error: {}, isLoading: true}

        case UPDATE_ALIAS_MAP:
            var aliasMap = {...state.aliasMap}
            aliasMap[action.alias] = action.userId
            return {...state, error: {}, aliasMap}

        case USER_REQUEST_ERROR:
            let error = {...action.error}
            if (Object.keys(error).length > 0) {
                error['receivedAt'] = action.receivedAt
            }
            // var errorsLog = {...state.errorsLog}
            // errorsLog[action.receivedAt] = error
            return {...state, error, isLoading: false}

        case GET_USER:
            var loggedIn = false
            let currentUser = {}
            var payload = {}
            const props = ['displayName', 'email', 'emailVerified', 
                'metadata', 'photoURL', 'providerData', 'uid']
            if (action.payload) {
                payload = action.payload
                loggedIn = true
                props.forEach(prop => currentUser[prop] = payload[prop])
                return {...state, error: {}, isLoading: false, ...currentUser, loggedIn}
            } else {
                const aliasMap = {...state.aliasMap}
                return {...state, error: {}, isLoading: false, loggedIn}
            }
            
        case RECEIVE_USER_DATA:
            var profiles = {...state.profiles}
            profiles[action.userId] = {...action.userData}
            return {...state, error: {}, isLoading: false, profiles}

        case RECEIVE_USER_STREAM:
            var streams = {...state.streams}
            streams[action.userId] = {...action.streams}
            return {...state, error: {}, isLoading: false, streams}

        default:
            return state;
    }

}

