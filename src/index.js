import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import LyddyStream from './containers/LyddyStream';
import Profile from './containers/ProfileMain';
import Social from './containers/Social';
import registerServiceWorker from './registerServiceWorker';
import { createLogger } from 'redux-logger'
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducers from './reducers/index';
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Login from './containers/Login'
import CreateAccount from './containers/CreateAccount'

const LOG = true
const IGNORED_ACTION = '@@redux'
const logger = createLogger({
    level: 'log',
    predicate: (getState, action) => !action.type.includes(IGNORED_ACTION)
});

const createStoreWithMiddleware = LOG? applyMiddleware(thunk, logger)(createStore) : applyMiddleware(thunk)(createStore)

const store = createStoreWithMiddleware(reducers)

const App = () => (
    <Provider store={store}>
        <BrowserRouter>
            <Switch>
                <Route path="/create-account" component={CreateAccount} />
                <Route path="/login" component={Login} />
                <Route path="/:user_alias/saved" component={Social} />
                <Route path="/:user_alias/tagged" component={Social} />
                <Route path="/:user_alias/:social(followers|following)" component={Social} />
                <Route path="/:user_alias" component={Profile} />
                <Route path="/" component={LyddyStream} />  
            </Switch>
        </BrowserRouter>
    </Provider>
)

ReactDOM.render(
    <App/>, 
    document.getElementById('root'));
// registerServiceWorker();