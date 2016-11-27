import _ from 'lodash';
import React from 'react';
import Marked from '../marked/marked.jsx';
import commonReact from '../../services/common-react';
import './document-terminal-error.css';

export default React.createClass({
  displayName: 'DocumentTerminalError',
  propTypes: {
    error: React.PropTypes.object,
    onInstallPythonModuleExternally: React.PropTypes.func.isRequired,
    text: React.PropTypes.string.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      contents = [],
      suggestions = [];

    className.push('font-monospaced');

    if (props.error) {
      if (props.error.code === 'ENOENT' && props.error.path) {
        contents.push(<Marked>{props.text.missingFileOrCommand + ': ' + props.error.path}</Marked>);
        suggestions.push(<Marked>{props.text.fixPythonCmd}</Marked>);
      } else if (props.error.syscall) {
        contents.push(<Marked>{props.text.unableToRunSyscall + ': ' + props.error.syscall}</Marked>);
        suggestions.push(<Marked>{props.text.fixPythonCmd}</Marked>);
      } else if (props.error.missingPackage) {
        contents.push(<Marked>{props.text.missingPackage + ': ' + props.error.missingPackage}</Marked>);
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
