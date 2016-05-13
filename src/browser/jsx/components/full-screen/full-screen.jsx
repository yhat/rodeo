import React from 'react';
import './full-screen.css';

/**
 * @class DocCode
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'FullScreen',
  propTypes: {
    row: React.PropTypes.bool
  },
  render: function () {
    const className = [
      'full-screen',
      this.props.row ? 'full-screen-row' : ''
    ].join(' ');

    return <div className={className}>{this.props.children}</div>;
  }
});
