import { FETCH_POSTS } from '../actions/PostActions'

export default function (state={}, action) {
    // console.log(action)
    switch (action.type) {
        case FETCH_POSTS:
            return action.payload;
        default:
            return state;
    }
}
