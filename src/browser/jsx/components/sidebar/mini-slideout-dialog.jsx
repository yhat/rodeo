import React from 'react';
import './slideout-dialog.css';

const showClass = 'mini-slideout-dialog-show';

/**
 * @class MiniSlideoutDialog
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'MiniSlideoutDialog',
  propTypes: {
    isExpanded: React.PropTypes.bool,
    url: React.PropTypes.string
  },
  render: function () {
    const props = this.props,
      className = [
        'mini-slideout-dialog',
        props.isExpanded ? showClass : ''
      ].join(' ');

    return (
      <div className={className}>
        <div>{'Documentation'}</div>
        <div>{'Community'}</div>
        <div>{'Github'}</div>
        <div>{'Accouncements'}</div>
      </div>
    );
  }
});
