import { connect } from 'react-redux'
import { skipLyd, togglePlay } from '../actions/PlayerActions' 
import { MainPlayer as Player } from '../components/LydPlayers'
import React from 'react'



const mapStateToProps = state => (
  {isPlaying: state.player.playing}
)
 
const mapDispatchToProps = (dispatch) => ({
  onTogglePlay: (lydId) => dispatch(togglePlay(lydId)),
  onBack: () => dispatch(skipLyd(-1)),
  onNext: () => dispatch(skipLyd(1))
})
 
export const MainPlayer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Player)