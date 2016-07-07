import React from 'react';

/**
 * @class SetupListItem
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'SetupListItem',
  propTypes: {
    disabled: React.PropTypes.bool,
    onClick: React.PropTypes.func
  },
  render: function () {
    const props = this.props;

    return (
      <li className="setup-list-item">
        <button className="btn btn-default" disabled={props.disabled} onClick={props.onClick}>
          {props.children}
        </button>
      </li>
    );
  }
});
