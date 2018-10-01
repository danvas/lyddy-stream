
import { 
    REQUEST_USER_DATA,
    UPDATE_ALIAS_MAPS,
    USER_REQUEST_ERROR,
    GET_USER, 
    RECEIVE_USER_DATA,
    RECEIVE_USER_STREAM
} from '../actions/UserActions';

export default function(state={pendRequests: [], numRequest: 0, numReceive: 0 , isLoading: true, loggedIn: false, 
    profiles: {}, streams: {}, aliasToId: {}, idToAlias: {}, error: {}}, action) {
    // console.log(action.userData)
    // console.log(state, action.payload)
    var pendRequests
    if (action.type === REQUEST_USER_DATA) {
        pendRequests = [...state.pendRequests, action.item]
    } else {
        pendRequests = state.pendRequests.slice(0, state.pendRequests.length - 1) 
    }

    switch (action.type) {
        case REQUEST_USER_DATA:
            return {...state, error: {}, pendRequests, numRequest: state.numRequest + 1, isLoading: true}

        case UPDATE_ALIAS_MAPS:
            
            var aliasToId = {...state.aliasToId}
            var idToAlias = {...state.idToAlias}
            var userId
            for (var alias in action.aliasToId) {
                userId = action.aliasToId[alias]
                aliasToId[alias] = userId
                idToAlias[userId] = alias
            }
            // aliasToId[action.alias] = action.userId
            // idToAlias[action.userId] = action.alias
            return {...state, error: {}, aliasToId, idToAlias, pendRequests}

        case USER_REQUEST_ERROR:
            let error = {...action.error}
            if (Object.keys(error).length > 0) {
                error['receivedAt'] = action.receivedAt
            }
            // var errorsLog = {...state.errorsLog}
            // errorsLog[action.receivedAt] = error
            return {...state, error, pendRequests, isLoading: false}

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
                return {...state, error: {}, isLoading: false, ...currentUser, pendRequests, loggedIn}
            } else {
                const aliasToId = {...state.aliasToId}
                return {...state, error: {}, isLoading: false, pendRequests, loggedIn}
            }
            
        case RECEIVE_USER_DATA:
            var profiles = {...state.profiles}
            profiles[action.userId] = {...action.userData}
            return {...state, error: {}, isLoading: false, numReceive: state.numReceive + 1, pendRequests, profiles}

        case RECEIVE_USER_STREAM:
            var streams = {...state.streams}
            streams[action.userId] = {...action.streams}
            return {...state, error: {}, isLoading: false, streams}

        default:
            return state;
    }

}

