import _ from 'lodash';
import React from 'react';
import Marked from '../marked/marked.jsx';
import commonReact from '../../services/common-react';
import './document-terminal-error.css';

export default React.createClass({
  displayName: 'DocumentTerminalError',
  propTypes: {
    data: React.PropTypes.object,
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

    if (props.data) {
      if (props.data.code === 'ENOENT' && props.data.path) {
        contents.push(<Marked>{props.text.missingFileOrCommand + ': ' + props.data.path}</Marked>);
        suggestions.push(<Marked>{props.text.fixPythonCmd}</Marked>);
      } else if (props.data.syscall) {
        contents.push(<Marked>{props.text.unableToRunSyscall + ': ' + props.data.syscall}</Marked>);
        suggestions.push(<Marked>{props.text.fixPythonCmd}</Marked>);
      } else if (props.data.missingPackage) {
        contents.push(<Marked>{props.text.missingPackage + ': ' + props.data.missingPackage}</Marked>);
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
