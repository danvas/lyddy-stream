import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import postReducer from './PostReducer';
import { playerReducer } from './PlayerReducer';
import UserReducer from './UserReducer'

const rootReducer = combineReducers({
    form: formReducer,
    posts: postReducer,
    player: playerReducer,
    user: UserReducer
});

export default rootReducer;