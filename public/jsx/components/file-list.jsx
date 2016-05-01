import React from 'react';
import FileListItem from './file-list-item.jsx';

export default React.createClass({
  displayName: 'FileList',
  propTypes: {
    basePath: React.PropTypes.string,
    onSelect: React.PropTypes.func
  },

  render: function () {
    const children = React.Children.map(this.props.children, function (child) {
      if (child && child.type === FileListItem) {
        return React.cloneElement(child, {basePath: this.props.basePath});
      } else {
        return child;
      }
    }.bind(this));

    return <div>{children}</div>;
  }
});