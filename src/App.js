import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import { connect } from 'react-redux';
import { fetchPosts, 
         savePost,
         deletePost } from './actions/PostActions';
import { togglePlay, 
         updateQueue} from './actions/PlayerActions';
import { Field, reduxForm, reset } from 'redux-form';
import LydItem from './components/LydItem';
import { MainPlayer } from './containers/PlayerContainer' 
import ReactPlayer from 'react-player'

var moment = require('moment');
const divStyle = {
  margin: '40px',
  border: '4px solid pink'
};

const h1Style = {
  textAlign: 'center'
};
const parseFieldValues = values => {
    let name = values.name
    let artists = values.artists
    
    if (!artists){
      const names = values.name.split('-');
      name = names[1].trim()
      artists = [names[0]]
    } else {
      artists = values.artists.split(',')
    }

    const newPost = {
        user_id: "F7G80ZQ0QffjiWtHT51tU8ztHRq1",
        source: values.url,
        name,
        artists,
        caption: "",
        "hashtags":[""],
        date_added: moment().format(),
        liked_by: [""],
        public: true,
    };

    return newPost
}

class App extends Component {

  constructor(props) {
    super(props);
    console.log("constructor()")
  }

  componentWillMount() {
    console.log("componentWillMount()")
  }

  componentDidMount() {
    console.log("componentDidMount()")
    const { dispatch, fetchPosts } = this.props
    fetchPosts();
  }

  renderPosts() {
    // console.log(this.props.player)
    const queuedIds = this.props.player.queuedIds
    let isPlaying = false
    let post = {}

    
    return _.map(queuedIds, key => {
      post = this.props.posts[key];
      isPlaying = (this.props.player.currentId === key)? 
        this.props.player.playing : false

      return (
        <div key={key}>
          <LydItem onClick={() => {this.props.togglePlay(key)}}
                   playing={isPlaying}
                   {...post} 
          />
          <button 
            onClick={()=>{ this.props.deletePost(key) }}
          >delete</button>
          <hr></hr>
        </div>

      )
    })
  }

  renderField(field) {
    return (
      <input 
        type="text" {...field.input} 
        placeholder={`${field.label}`} 
      />
    )
  }

  onSubmit(values) {
    const { dispatch } = this.props;
    const newPost = parseFieldValues(values)
    this.props.savePost(newPost).then(dispatch(reset('NewPost')))
  }

  render() {
    console.log("render()...")
    const { handleSubmit, posts, player } = this.props;
    const currentId = player.currentId
    const currentLyd = posts[currentId]
    const playing = player.playing

    return (
      <div>

      <div>
        <MainPlayer lyd={currentLyd} lydId={currentId}/>
        </div>
        {this.renderPosts()}
        <div>
          <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
            <Field 
              name="name"
              component={this.renderField}
              label="name"
            />
            <Field 
              name="artists"
              component={this.renderField}
              label="artists"
            />     
            <Field 
              name="url"
              component={this.renderField}
              label="url"
            />
            <button type="submit">Post</button>
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    posts: state.posts, 
    player: state.player,
    items: state.items,
    hasErrored: state.itemsHasErrored,
    isLoading: state.itemsIsLoading
  }
}

let form = reduxForm({
  form: 'NewPost'
})(App);

form = connect(
   mapStateToProps, 
  { fetchPosts,
    savePost,
    deletePost,
    togglePlay
  }
)(form);

export default form;
