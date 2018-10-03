import React from 'react';
import { ArtistNames } from './LydPlayers'
import _ from 'lodash';

var moment = require('moment');

export const HashTagsList = ({ hashtags }) => {
  return _.map(hashtags, (hashtag, key) => {
    return (
      <span key={key}>{hashtag? `#${hashtag}` : null} </span>
    );
  });
}

export const DateAdded = ({ datetime, user}) => {
  const formattedDate = (datetime ? 
                      `Added ${moment(datetime).fromNow()}` 
                      : '');
  const userLink = `/${user}` 
  return <p><sub>{formattedDate} by <a href={userLink}>{user}</a></sub></p>
}

const LydItem = props => {
      return (
        <div>
          <h3>{props.name}</h3>
          <ArtistNames artists={props.artists} delimiter={', '} />
          <p>{props.caption}</p>
          <HashTagsList hashtags={props.hashtags} />
          <button onClick={props.onTogglePlay}>{props.playing ? 'Pause' : 'Play'}</button>
          {false && <a href={props.source} target="_blank">source</a>}
          <DateAdded datetime={props.date_added} user={props.userName}/>
          {props.onDelete && <button onClick={props.onDelete}>delete</button>}
          <hr></hr>
        </div>
      );
}

export default LydItem;