import React from 'react';
import commonReact from '../../services/common-react';
import './line.css';

export default React.createClass({
  displayName: 'BlockHistory',
  propTypes: {
    id: React.PropTypes.string.isRequired,
    source: React.PropTypes.string.isRequired,
    text: React.PropTypes.string.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    className.push(props.source);
    return <div className={className.join(' ')} id={props.id}>{props.text}</div>;
  }
});
