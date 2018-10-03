import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { savePost } from '../actions/PostActions';
import UrlSourceForm from '../components/UrlSourceForm';

var moment = require('moment');

const parseFieldValues = values => {
    console.log(values)
    let name = values.name
    let artists = values.artists
    
    if (!artists){
      const names = values.name.split('-');
      artists = ['unknown']
      console.log(names)
      if (names.length === 2){
        artists = [names[0].trim()]
        name = names[1].trim()
      }
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

    // componentWillMount() {
    //     const { getUser, user } = this.props;
    //     if (!user.uid){
    //       console.log("SourceSubmitter.getUser!!")
    //       getUser();  
    //     } 
    // }

    onSubmit(values) {
        const { dispatch, user, savePost } = this.props;
        let newPost = {}
        try {
            newPost = parseFieldValues(values)
        } 
        catch(error) {
            console.log(error)
            let msg = "Oops! There was an error. I'll fix this as soon as I can."
            
            if (values.name === undefined) {
                msg = "Enter a name for the track"
            }

            if (values.source === undefined) {
                msg = "Enter the track's URL"
            }

            window.alert(msg)
            return
        }
        newPost.user_id = user.uid
        console.log(newPost)
        savePost(newPost)
        // pushToPlaylist(newPost.lyd)
    }

    render() {
        console.log("SourceSubmitter.render... props:", this.props)
        const { handleSubmit, user } = this.props;
        console.log(user)
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
  savePost: lyd => dispatch(savePost(lyd))
})

let form = reduxForm({
  form: 'NewPost'
})(SourceSubmitter)

export default connect(
    mapStateToProps, 
    { savePost }
)(form);

