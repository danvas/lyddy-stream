import React from 'react';
import _ from 'lodash';

var moment = require('moment');


const SocialItem = props => {
  console.log(props)
  const userLink = `/${props.userName}`
  return (
    <div>
      <span>
        <div><a href={userLink}>{props.userName}</a></div>
        {props.socialButton}
      </span>
      {false && <a href={props.source} target="_blank">source</a>}
      <hr></hr>
    </div>
  );
}

export default SocialItem;