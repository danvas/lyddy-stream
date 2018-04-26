import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { savePost } from '../actions/PostActions';
import { getUser } from '../actions/UserActions';
import UrlSourceForm from '../components/UrlSourceForm';

var moment = require('moment');

const parseFieldValues = values => {
    let name = values.name
    let artists = values.artists
    
    if (!artists){
      const names = values.name.split('-');
      name = names[1].trim()
      artists = [names[0].trim()]
    } else {
      artists = values.artists.split(',')
    }

    const newPost = {
        source: values.source,
        name,
        artists,
        caption: "",
        hashtags: [""],
        date_added: moment().format(),
        liked_by: [""],
        public: true,
    };

    return newPost
}

class SourceSubmitter extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const { getUser, user } = this.props;
        if (!user.uid){
          getUser();  
        } 

    }

    onSubmit(values) {
        const { dispatch, user, savePost } = this.props;
        const newPost = parseFieldValues(values)
        newPost.user_id = user.uid
        savePost(newPost)
        // pushToPlaylist(newPost.lyd)
    }

    render() {
        const { handleSubmit, user } = this.props;
        return (
            <div>
                <UrlSourceForm onSubmitAction={handleSubmit(this.onSubmit.bind(this))} />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return { user: state.user }
}

const mapDispatchToProps = dispatch => ({
  savePost: lyd => dispatch(savePost(lyd)),
  getUser
})

let form = reduxForm({
  form: 'NewPost'
})(SourceSubmitter)

export default connect(
    mapStateToProps, 
    { savePost, getUser }
)(form);

