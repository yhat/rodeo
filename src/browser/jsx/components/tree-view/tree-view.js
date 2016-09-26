import React from 'react';
import commonReact from '../../services/common-react';
import TreeViewItem from './tree-view-item';
import './tree-view.css';

export default React.createClass({
  displayName: 'TreeView',
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  propsTypes: {
    height: React.PropTypes.number,
    items: React.PropTypes.array.isRequired,
    width: React.PropTypes.number
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return <TreeViewItem className={className.join(' ')} {...props} expanded showCaret={false} />;
  }
});
