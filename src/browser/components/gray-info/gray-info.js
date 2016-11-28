import React from 'react';
import './gray-info.css';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'GrayInfo',
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return <div className={className}>{props.children}</div>;
  }
});
