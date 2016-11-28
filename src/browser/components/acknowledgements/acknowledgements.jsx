import React from 'react';
import Marked from '../marked/marked.jsx';
import acknowledgementsText from './acknowledgements.md';
import './acknowledgements.css';
import rodeoTextDarkImage from './rodeo-text-dark.png';

/**
 * @class Acknowledgements
 * @extends ReactComponent
 * @property props
 */
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
