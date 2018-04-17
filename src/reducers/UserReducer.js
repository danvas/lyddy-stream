
import { GET_USER, SET_USER_DATA} from '../actions/UserActions';

export default function(state={loading: true}, action) {
    switch (action.type) {
        case GET_USER:
            return {loading: false, ...action.payload}
        case SET_USER_DATA:
            return {loading: false, ...state, ...action.userData}
        default:
            return state;
    }

}