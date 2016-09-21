import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';

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
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')} onClick={props.onClick}>{props.children}</div>
    );
  }
});
