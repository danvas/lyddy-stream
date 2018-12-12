
import { 
    REQUEST_USER_DATA,
    RECEIVE_USER_AUTH,
    RECEIVE_ALIAS_MAPS,
    UPDATE_ALIAS_MAPS,
    USER_REQUEST_ERROR,
    GET_USER, 
    RECEIVE_USER_DATA,
    RECEIVE_USER_FOLLOWING,
    UPDATE_USER_FOLLOWING,
    RECEIVE_USER_STREAM
} from '../actions/UserActions';

const defState = {pendRequests: [], numRequest: 0, numReceive: 0,
    isLoading: true, loggedIn: false, profiles: {}, streams: {},
    aliasToId: {}, idToAlias: {}, following: null, error: {}}

const getRequestStatus = (action, pendingRequests) => {
    var pendRequests
    const incrPendingRequests = action.type.includes('REQUEST_USER')
    const decrPendingRequests = action.type.includes('RECEIVE_')
    const resetPendingRequests = action.type.includes('REQUEST_ERROR')
    if (incrPendingRequests) {
        pendRequests = [...pendingRequests, action.item]
    } else if (decrPendingRequests) {
        pendRequests = pendingRequests.slice(0, pendingRequests.length - 1) 
    } else if (resetPendingRequests) {
        pendRequests = []
    } else {
        pendRequests = [...pendingRequests]
    }
    const isLoading = pendRequests.length > 0
    
    return {pendRequests, isLoading}
}

export default function(state=defState, action) {
    // console.log(action.userData)
    // console.log(state, action.payload)
    const { pendRequests, isLoading } = getRequestStatus(action, state.pendRequests)
    // console.log(pendRequests, isLoading)
    switch (action.type) {
        case REQUEST_USER_DATA:
            return {...state, error: {}, pendRequests, numRequest: state.numRequest + 1, isLoading}
        case RECEIVE_ALIAS_MAPS:
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
            return {...state, error: {}, aliasToId, idToAlias, pendRequests, isLoading}

        case USER_REQUEST_ERROR:
            let error = {...action.error}
            if (Object.keys(error).length > 0) {
                error['receivedAt'] = action.receivedAt
            }
            // var errorsLog = {...state.errorsLog}
            // errorsLog[action.receivedAt] = error
            return {...state, error, pendRequests, isLoading}

        case RECEIVE_USER_AUTH:
            var loggedIn = false
            let currentUser = {}
            var payload = {}
            const props = ['displayName', 'email', 'emailVerified', 
                'metadata', 'photoURL', 'providerData', 'uid']
            if (action.payload) {
                payload = action.payload
                loggedIn = true
                props.forEach(prop => currentUser[prop] = payload[prop])
                return {...state, error: {}, isLoading, ...currentUser, pendRequests, loggedIn}
            } else {
                return {...defState, isLoading, pendRequests}
            }

        case UPDATE_USER_FOLLOWING:
            let following = {...state.following}
            if (action.socialItem) {
                following[action.userId] = {...action.socialItem}
            } else {
                delete following[action.userId]
            }
            return {...state, following, isLoading, pendRequests}
        
        case RECEIVE_USER_FOLLOWING:
            return {...state, following: {...action.following}, isLoading, pendRequests}

        case RECEIVE_USER_DATA:
            let newState = {...state, error: {}, isLoading, numReceive: state.numReceive + 1, pendRequests}
            if (action.isAuthUser) {
                newState = {...newState, ...action.userData}
            } 
            var profiles = {...state.profiles}
            profiles[action.userId] = {...action.userData}
            newState = {...newState, profiles}
            return newState

        case RECEIVE_USER_STREAM:
            var streams = {...state.streams}
            streams[action.userId] = {...action.streams}
            return {...state, error: {}, isLoading, streams}

        default:
            return state;
    }

}

