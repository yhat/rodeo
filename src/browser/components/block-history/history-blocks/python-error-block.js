/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';
import ExpandBlockButton from '../expand-block-button';
import './python-error-block.css';

export default React.createClass({
  displayName: 'PythonErrorBlock',
  propTypes: {
    expanded: React.PropTypes.bool,
    name: React.PropTypes.string,
    onBlur: React.PropTypes.func,
    onClick: React.PropTypes.func,
    onContract: React.PropTypes.func,
    onCopy: React.PropTypes.func,
    onCut: React.PropTypes.func,
    onExpand: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onInstallPythonModule: React.PropTypes.func.isRequired,
    onKeyDown: React.PropTypes.func,
    onKeyPress: React.PropTypes.func,
    onKeyUp: React.PropTypes.func,
    onPaste: React.PropTypes.func,
    stacktrace: React.PropTypes.array,
    value: React.PropTypes.string
  },
  getDefaultProps: function () {
    return {
      chunks: [],
      expanded: false
    };
  },

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      menu = [], actions = [];
    let contents = [], stacktrace = [], suggestions, expandButton;

    className.push('font-monospaced');

    function asHTML(line) {
      /* eslint react/no-danger: 0 */
      return <div dangerouslySetInnerHTML={{__html: line}} />;
    }

    if (props.name && props.value) {
      contents.push(<div key="firstLine">{props.name + ': ' + props.value}</div>);
    } else if (props.name) {
      contents.push(<div key="firstLine">{props.name}</div>);
    }

    if (props.stacktrace.length > 5) {
      if (props.expanded) {
        menu.push(<span className="fa fa-compress" key="contract" onClick={props.onContract}/>);
        stacktrace = props.stacktrace.map(asHTML);
        contents.push(<div className="python-error-block-stacktrace" key="stacktrace">{stacktrace}</div>);
        className.push('python-error-block--expanded');
      } else {
        menu.push(<span className="fa fa-expand" key="expand" onClick={props.onExpand}/>);
        stacktrace = _.takeRight(props.stacktrace, 5).map(asHTML);
        contents.push(<div className="python-error-block-stacktrace" key="stacktrace">{stacktrace}</div>);
        className.push('python-error-block--compressed');
      }

      expandButton = (
        <ExpandBlockButton
          direction={props.expanded ? 'up' : 'down'}
          onClick={props.expanded ? props.onContract : props.onExpand}
        />
      );
    } else {
      stacktrace = props.stacktrace.map(asHTML);
      contents.push(<div className="python-error-block-stacktrace" key="stacktrace">{stacktrace}</div>);
    }

    if (_.isString(props.value) && props.name === 'ImportError') {
      const match = props.value.match(/No module named (.*)/);

      if (match) {
        const moduleName = match[1];

        actions.push(
          <button
            className="btn btn-default"
            key="import"
            onClick={_.partial(props.onInstallPythonModule, moduleName)}
          >{`Install ${moduleName}`}</button>
        );
      }
    }

    if (actions) {
      suggestions = <div className="python-error-block__suggestions">{actions}</div>;
      contents.push(suggestions);
    }

    return (
      <section
        className={className.join(' ')}
        onBlur={props.onBlur}
        onClick={props.onClick}
        onCopy={props.onCopy}
        onCut={props.onCut}
        onFocus={props.onFocus}
        onKeyDown={props.onKeyDown}
        onKeyPress={props.onKeyPress}
        onKeyUp={props.onKeyUp}
        onPaste={props.onPaste}
        tabIndex={props.tabIndex || 0}
      >
        <header>{'python error'}</header>
        <div className="python-error-block__menu">
          {menu}
        </div>
        <div className="python-error-block__contents-outer">
          <div className="python-error-block__contents">{contents}</div>
        </div>
        {expandButton}
        </section>
    );
  }
});
