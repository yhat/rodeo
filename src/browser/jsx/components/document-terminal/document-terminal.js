import React from 'react';
import commonReact from '../../services/common-react';
import './document-terminal.css';

export default React.createClass({
  displayName: 'DocumentTerminal',
  propTypes: {
    onClick: React.PropTypes.func,
    onPaste: React.PropTypes.func
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      style = {
        fontSize: props.fontSize + 'px'
      };

    className.push('font-monospaced');

    return (
      <div
        className={className.join(' ')}
        onClick={props.onClick}
        onPaste={props.onPaste}
        style={style}
      >{props.children}</div>
    );
  }
});
