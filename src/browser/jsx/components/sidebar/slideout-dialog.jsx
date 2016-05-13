import React from 'react';
import './slideout-dialog.css';

const showClass = 'slideout-dialog-show';

/**
 * @class SlideoutDialog
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'SlideoutDialog',
  propTypes: {
    isExpanded: React.PropTypes.bool,
    url: React.PropTypes.string
  },
  render: function () {
    const props = this.props,
      className = [
        'slideout-dialog',
        props.isExpanded ? showClass : ''
      ].join(' ');

    return (
      <div className={className}>
        <iframe frameBorder="0" src={props.url}></iframe>
      </div>
    );
  }
});
