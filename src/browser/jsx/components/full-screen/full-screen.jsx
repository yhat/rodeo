import React from 'react';
import './full-screen.css';

/**
 * @class DocCode
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'FullScreen',
  render: function () {
    return <div className="full-screen">{this.props.children}</div>;
  }
});
