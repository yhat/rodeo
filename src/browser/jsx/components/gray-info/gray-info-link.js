import React from 'react';
import './gray-info.css';
import commonReact from '../../services/common-react';

export default React.createClass({
  displayName: 'GrayInfoLink',
  propTypes: {
    onClick: React.PropTypes.func.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return <div className={className} onClick={props.onClick}>{props.children}</div>;
  }
});
