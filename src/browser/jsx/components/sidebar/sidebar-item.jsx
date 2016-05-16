import _ from 'lodash';
import React from 'react';

/**
 * @class SidebarItem
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'SidebarItem',
  propTypes: {
    icon: React.PropTypes.string,
    id: React.PropTypes.string,
    label: React.PropTypes.string,
    onClick: React.PropTypes.func
  },
  getDefaultProps: function () {
    return {
      onClick: _.noop
    };
  },
  render: function () {
    const props = this.props;

    return (
      <div className="sidebar-item" onClick={props.onClick}>{props.children}</div>
    );
  }
});
