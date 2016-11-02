import React from 'react';
import commonReact from '../../services/common-react';
import './document-terminal-text.css';

export default React.createClass({
  displayName: 'DocumentTerminalText',
  propTypes: {
    html: React.PropTypes.string.isRequired,
    id: React.PropTypes.string.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div
        className={className.join(' ')}
        dangerouslySetInnerHTML={{__html: props.html}}
        id={props.id}
      />
    );
  }
});
