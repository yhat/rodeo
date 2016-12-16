import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './document-terminal-python-error.css';

function getFirstLine(props) {
  if (props.name && props.value) {
    return props.name + ': ' + props.value;
  } else if (props.name) {
    return props.name;
  }
}

function getImportErrorModuleName(props) {
  if (_.isString(props.value) && props.name === 'ImportError') {
    const match = props.value.match(/No module named (.*)/);

    if (match) {
      return match[1];
    }
  }

  return null;
}

export default React.createClass({
  displayName: 'DocumentTerminalPythonError',
  propTypes: {
    name: React.PropTypes.string.isRequired,
    onInstallPythonPackage: React.PropTypes.func.isRequired,
    stacktrace: React.PropTypes.array.isRequired,
    value: React.PropTypes.string // not required!
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      contents = [],
      suggestions = [],
      importErrorModuleName = getImportErrorModuleName(props);

    className.push('font-monospaced');

    function asHTML(line) {
      /* eslint react/no-danger: 0 */
      return <div dangerouslySetInnerHTML={{__html: line}} />;
    }

    contents.push(<div key="firstLine">{getFirstLine(props)}</div>);
    contents.push(<div className="python-error-block-stacktrace" key="stacktrace">{props.stacktrace.map(asHTML)}</div>);

    if (importErrorModuleName) {
      suggestions.push(
        <button
          className="btn btn-default"
          key="import"
          onClick={_.partial(props.onInstallPythonPackage, importErrorModuleName, null)}
        >{`Install ${importErrorModuleName}`}</button>
      );
    }

    if (suggestions.length) {
      contents.push(<div className="python-error-block__suggestions" key="suggestions">{suggestions}</div>);
    }

    return <div className={className.join(' ')}>{contents}</div>;
  }
});
