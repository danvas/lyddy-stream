import React, { Component } from 'react';
import ReactPlayer from 'react-player';
import Duration from '../utils/Duration';
import _ from 'lodash';
var moment = require('moment');

const divStyle = {
  margin: '40px',
  border: '4px solid pink'
};

const h1Style = {
  textAlign: 'center'
};

export const SkipButton = ({amount, isPlaying, onSkip}) => {
  const label = amount < 0? "Back" : "Next"
  return <button disabled={!isPlaying} onClick={onSkip}>{label}</button>

}

const HashTagsList = ({ hashtags }) => {
  return _.map(hashtags, (hashtag, key) => {
    return (
      <span key={key}>#{hashtag} </span>
    );
  });
}

const DateAdded = ({ datetime }) => {
  let formattedDate = (datetime ? 
                      `Added ${moment(datetime).fromNow()}` 
                      : '');
  return <p><sub>{formattedDate}</sub></p>
}

export const ArtistNames = ({ style, artists, delimiter }) => {
  // var artistNames = artists? artists.join(delimiter) : 'unknown';
  return <p style={style}>{artists.join(delimiter)}</p>
}

export class MainPlayer extends Component {
//TODO: Make props only use lyd id? THen we can get the ly
  render() {
    const {lyd, isPlaying, onTogglePlay, onBack, onNext, onStop} = this.props
    return (
        <div>
            <div>
              <ReactPlayer               
                width={0}
                height={0}
                url={lyd? lyd.source : ''}
                playing={isPlaying}
                onEnded={onNext}
              /> 
            </div>
            <div style={divStyle}>
              <h1 style={h1Style}>{lyd? lyd.name : ''}</h1>
              <ArtistNames style={h1Style} artists={lyd? lyd.artists : []} delimiter={' • '} />
              <button onClick={() => onTogglePlay(lyd.lyd_id)}>{isPlaying ? 'Pause' : 'Play'}</button>
              <button disabled={!isPlaying} onClick={onBack}>Back</button>
              <button disabled={!isPlaying} onClick={onNext}>Next</button>
            </div>
          </div>
    )
  }
}

