import React from 'react';
import './tabbed-pane-item.css';

/**
 * @class TabbedPaneItem
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'TabbedPaneItem',
  propTypes: {
    active: React.PropTypes.bool,
    closeable: React.PropTypes.bool,
    icon: React.PropTypes.string,
    id: React.PropTypes.string,
    label: React.PropTypes.string.isRequired
  },
  render: function () {
    const props = this.props,
      className = ['tabbed-pane-item'];

    if (props.active) {
      className.push('active');
    }

    return <div className={className.join(' ')} id={props.id}>{props.children}</div>;
  }
});
