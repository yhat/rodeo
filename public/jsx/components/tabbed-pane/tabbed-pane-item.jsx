import React from 'react';

export default React.createClass({
  displayName: 'TabbedPaneItem',
  propTypes: {
    active: React.PropTypes.bool,
    icon: React.PropTypes.string,
    isCloseable: React.PropTypes.bool,
    label: React.PropTypes.string.isRequired
  },
  render: function () {
    const className = [
      'tab-pane',
      this.props.active ? 'active' : ''
    ].join(' ');

    return <div className={className}>{this.props.children}</div>;
  }
});