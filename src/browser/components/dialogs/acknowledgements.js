import React from 'react';
import Marked from '../marked';
import acknowledgementsText from './acknowledgements.md';
import './acknowledgements.css';
import rodeoTextDarkImage from './rodeo-text-dark.png';

export default React.createClass({
  displayName: 'Acknowledgements',
  render: function () {
    return (
      <div className="acknowledgements">
        <img src={rodeoTextDarkImage}/>
        <div className="scrollable">
          <Marked>{acknowledgementsText}</Marked>
        </div>
      </div>
    );
  }
});
