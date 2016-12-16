import React from 'react';
import Marked from '../marked';
import commonReact from '../../services/common-react';
import './document-terminal-error.css';

export default React.createClass({
  displayName: 'DocumentTerminalError',
  propTypes: {
    error: React.PropTypes.object,
    onInstallPythonPackage: React.PropTypes.func.isRequired
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      text = this.context.text,
      className = commonReact.getClassNameList(this),
      contents = [],
      suggestions = [];

    className.push('font-monospaced');

    if (props.error) {
      if (props.error.code === 'ENOENT' && props.error.path) {
        contents.push(<Marked>{text.missingFileOrCommand + ': ' + props.error.path}</Marked>);
        suggestions.push(<Marked>{text.fixPythonCmd}</Marked>);
      } else if (props.error.syscall) {
        contents.push(<Marked>{text.unableToRunSyscall + ': ' + props.error.syscall}</Marked>);
        suggestions.push(<Marked>{text.fixPythonCmd}</Marked>);
      } else if (props.error.missingPackage) {
        contents.push(<Marked>{text.missingPackage + ': ' + props.error.missingPackage}</Marked>);
      } else if (props.error.message) {
        contents.push(<Marked>{props.error.message}</Marked>);
      }
    }

    return (
      <div className={className.join(' ')}>
        {contents}
        {suggestions}
      </div>
    );
  }
});
