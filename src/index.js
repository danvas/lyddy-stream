import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import LyddyStream from './containers/LyddyStream';
import ProfileMain from './containers/ProfileMain';
import Social from './containers/Social';
import registerServiceWorker from './registerServiceWorker';
import { createLogger } from 'redux-logger'
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducers from './reducers/index';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom'
import Login from './containers/Login'
import CreateAccount from './containers/CreateAccount'
import { auth }  from './Firebase';
const LOG = true
const IGNORED_ACTION = '@@redux'
const logger = createLogger({
    level: 'log',
    predicate: (getState, action) => !action.type.includes(IGNORED_ACTION)
});


const createStoreWithMiddleware = LOG? applyMiddleware(thunk, logger)(createStore) : applyMiddleware(thunk)(createStore)

const store = createStoreWithMiddleware(reducers)

class ModalSwitch extends React.Component {
  // We can pass a location to <Switch/> that will tell it to
  // ignore the router's current location and use the location
  // prop instead.
  //
  // We can also use "location state" to tell the app the user
  // wants to go to `/gallery/2` in a modal, rather than as the
  // main page, keeping the gallery visible behind it.
  //
  // Normally, `/gallery/2` wouldn't match the gallery at `/`.
  // So, to get both screens to render, we can save the old
  // location and pass it to Switch, so it will think the location
  // is still `/` even though its `/gallery/2`.
  previousLocation = this.props.location;

  componentWillUpdate(nextProps) {
    const { location } = this.props;
    // set previousLocation if props.location is not modal
    if (
      nextProps.history.action !== "POP" &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = this.props.location;
    }
  }

  render() {
    const { location } = this.props;
    const isModal = !!(
      location.state &&
      location.state.modal &&
      this.previousLocation !== location
    ); // not initial render
    return (
      <div>
        <Switch location={isModal ? this.previousLocation : location}>
            <Route exact path="/" component={LyddyStream} />  
            <Route path="/gallery" component={Gallery} />
            <Route path="/gallery/:id" component={ImageView} />
            <Route path="/create-account" component={CreateAccount} />
            <Route path="/login" component={Login} />
            <Route path="/:user_alias/playlists/:playlist" component={LyddyStream} />
            <Route path="/:user_alias/:social(followers|following)" component={Social} />
            <Route path="/:user_alias" component={ProfileMain} />
        </Switch>
        {isModal ? <Route path="/gallery/:id" component={Modal} /> : null}
      </div>
    );
  }
}

const IMAGES = [
  { id: 0, title: "Dark Orchid", color: "DarkOrchid" },
  { id: 1, title: "Lime Green", color: "LimeGreen" },
  { id: 2, title: "Tomato", color: "Tomato" },
  { id: 3, title: "Seven Ate Nine", color: "#789" },
  { id: 4, title: "Crimson", color: "Crimson" }
];

const Thumbnail = ({ color }) => (
  <div
    style={{
      width: 50,
      height: 50,
      background: color
    }}
  />
);

const Image = ({ color }) => (
  <div
    style={{
      width: "100%",
      height: 400,
      background: color
    }}
  />
);

const Home = () => (
  <div>
    <Link to="/gallery">Visit the Gallery</Link>
    <h2>Featured Images</h2>
    <ul>
      <li>
        <Link to="/gallery/2">Tomato</Link>
      </li>
      <li>
        <Link to="/gallery/4">Crimson</Link>
      </li>
    </ul>
  </div>
);

const Gallery = () => (
  <div>
    {IMAGES.map(i => (
      <Link
        key={i.id}
        to={{
          pathname: `/gallery/${i.id}`,
          // this is the trick!
          state: { modal: true }
        }}
      >
        <Thumbnail color={i.color} />
        <p>{i.title}</p>
      </Link>
    ))}
  </div>
);

const ImageView = ({ match }) => {
  const image = IMAGES[parseInt(match.params.id, 10)];
  if (!image) {
    return <div>Image not found</div>;
  }

  return (
    <div>
      <h1>{image.title}</h1>
      <Image color={image.color} />
    </div>
  );
};

const Modal = ({ match, history }) => {
  const image = IMAGES[parseInt(match.params.id, 10)];
  if (!image) {
    return null;
  }
  const back = e => {
    e.stopPropagation();
    history.goBack();
  };
  return (
    <div
      onClick={back}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        background: "rgba(0, 0, 0, 0.15)"
      }}
    >
      <div
        className="modal"
        style={{
          position: "absolute",
          background: "#fff",
          top: 25,
          left: "10%",
          right: "10%",
          padding: 15,
          border: "2px solid #444"
        }}
      >
        <h1>{image.title}</h1>
        <Image color={image.color} />
        <button type="button" onClick={back}>
          Close
        </button>
      </div>
    </div>
  );
};

const App = () => (
    <Provider store={store}>
        <BrowserRouter>
            <Route component={ModalSwitch} />
        </BrowserRouter>
    </Provider>
)

ReactDOM.render(
    <App/>, 
    document.getElementById('root'));
// registerServiceWorker();