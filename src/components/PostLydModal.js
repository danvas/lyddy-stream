import React from 'react';
import PropTypes from 'prop-types';
import SourceSubmitter from '../containers/SourceSubmitter'
// Code derived from https://daveceddia.com/open-modal-in-react/

class PostLydModal extends React.Component {
  render() {
    // console.log("PostLydModal.props", this.props)
    // Render nothing if the "show" prop is false
    if(!this.props.show) {
      return null;
    }

    // The gray background
    const backdropStyle = {
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: 50
    };

    // The modal "window"
    const modalStyle = {
      backgroundColor: '#fff',
      borderRadius: 5,
      maxWidth: 500,
      minHeight: 300,
      margin: '0 auto',
      padding: 30
    };

    return (
      <div>
        <SourceSubmitter/>
      </div>
    );
  }
}

PostLydModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node
};

export default PostLydModal;