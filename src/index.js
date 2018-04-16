import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ListPosts from './containers/ListPosts';
import LyddyStream from './containers/LyddyStream';
import registerServiceWorker from './registerServiceWorker';
import { createLogger } from 'redux-logger'
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducers from './reducers/index';
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Login from './containers/Login'
import CreateAccount from './containers/CreateAccount'

const IGNORED_ACTION = '@@redux-form/'
const logger = createLogger({
    level: 'log',
    predicate: (getState, action) => !action.type.includes(IGNORED_ACTION)
});

const createStoreWithMiddleware = applyMiddleware(thunk, logger)(createStore)

const store = createStoreWithMiddleware(reducers)

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <Switch>
                <Route path="/login" component={Login} />
                <Route path="/create-account" component={CreateAccount} />
                <Route path="/" component={LyddyStream} />
            </Switch>
        </BrowserRouter>
    </Provider>, 
    document.getElementById('root'));
// registerServiceWorker();
