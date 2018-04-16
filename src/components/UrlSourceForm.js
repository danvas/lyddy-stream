import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Field } from 'redux-form';

var moment = require('moment');

const textField = field => {
    return (
      <input 
        type="text" {...field.input} 
        placeholder={`${field.label}`} 
      />
    )
  }

export default class UrlSourceForm extends Component {
  
  render() {
    const { onSubmitAction } = this.props
    return (
         <div>
            <form onSubmit={onSubmitAction}>
              <Field 
                name="name"
                component={textField}
                label="name"
              />
              <Field 
                name="artists"
                component={textField}
                label="artists"
              />     
              <Field 
                name="source"
                component={textField}
                label="url"
              />
              <button type="submit">Post</button>
            </form>
          </div>
    )
  }
}

UrlSourceForm.propTypes = {
  onSubmitAction: PropTypes.func.isRequired
}