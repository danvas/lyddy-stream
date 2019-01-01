import React from 'react';
import _ from 'lodash';

var moment = require('moment');


const SocialItem = props => {
  const userLink = `/${props.userName}`
  return (
    <div>
      <span>
        <div><img src={props.sourceImg} alt={props.userName + " pic"} width="42" height="42"></img></div>
        <div><a href={userLink}>{props.userName}</a></div>
        {props.socialButton}
      </span>
      {false && <a href={props.source} target="_blank">source</a>}
      <hr></hr>
    </div>
  );
}

export default SocialItem;