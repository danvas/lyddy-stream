import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import { connect } from 'react-redux';
import { fetchPosts, 
         savePost,
         deletePost } from './actions/PostActions';
import { Field, reduxForm, reset } from 'redux-form';


class App extends Component {
  componentWillMount() {
    this.props.fetchPosts();
  }

  renderPosts() {
    return _.map(this.props.posts, (post, key) => {
      return (
        <div key={key}>
          <h3>{post.title}</h3>
          <p>{post.caption}</p>  
          <button 
            onClick={()=>{ this.props.deletePost(key) }}
          >delete</button>
          <hr></hr>
        </div>

      );
    });
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
    this.props.savePost(values).then(this.props.dispatch(reset('NewPost')));
  }
  render() {
    const { handleSubmit } = this.props;
    return (

      <div>
        <div>
        {this.renderPosts()}
        </div>
        <div>
          <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
            <Field 
              name="title"
              component={this.renderField}
              label="title"
            />          
            <Field 
              name="caption"
              component={this.renderField}
              label="caption"
            />
            <button type="submit">Post</button>
          </form>
        </div>
      </div>
    );
  }
}

let form = reduxForm({
  form: 'NewPost'
})(App);

form = connect(state => ({
  posts: state.posts
}), { fetchPosts,
      savePost,
      deletePost
    })(form);

export default form;
