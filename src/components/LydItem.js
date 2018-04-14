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

export const DateAdded = ({ datetime }) => {
  let formattedDate = (datetime ? 
                      `Added ${moment(datetime).fromNow()}` 
                      : '');
  return <p><sub>{formattedDate}</sub></p>
}

const LydItem = props => {
      return (
        <div>
          <h3>{props.name}</h3>
          <ArtistNames artists={props.artists} delimiter={', '} />
          <p>{props.caption}</p>
          <HashTagsList hashtags={props.hashtags} />
          <button onClick={props.onTogglePlay}>{props.playing ? 'Pause' : 'Play'}</button>
          {false? <a href={props.source} target="_blank">source</a> : null}
          <DateAdded datetime={props.date_added} />
          <button onClick={props.onDelete}>delete</button>
          <hr></hr>
        </div>
      );
}

export default LydItem;