import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import postReducer from './PostReducer';
import { playerReducer } from './PlayerReducer';


const rootReducer = combineReducers({
    form: formReducer,
    posts: postReducer,
    player: playerReducer
});

export default rootReducer;