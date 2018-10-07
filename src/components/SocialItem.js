import React from 'react';
import _ from 'lodash';

var moment = require('moment');


const getActionName = status => {
  switch (status) {
    case 0:
      return "Approve"
    case 1:
      return "Following"
    case 2:
      return "Unblock"
    default:
      return "Follow back"
  }
}

const SocialItem = props => {
  const status = getActionName(props.status)
  const userLink = `/${props.userName}`
  return (
    <div>
      <span><div><a href={userLink}>{props.userName}</a></div>
      <button onClick={()=>console.log(props.user_id, "status:", props.status)}>{status}</button></span>
      {false && <a href={props.source} target="_blank">source</a>}
      {props.onDelete && <button onClick={props.onDelete}>delete</button>}
      <hr></hr>
    </div>
  );
}

export default SocialItem;