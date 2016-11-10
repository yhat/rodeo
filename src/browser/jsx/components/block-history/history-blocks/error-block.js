/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import React from 'react';
import commonReact from '../../../services/common-react';
import './error-block.css';

export default React.createClass({
  displayName: 'ErrorBlock',
  propTypes: {
    expanded: React.PropTypes.bool,
    message: React.PropTypes.string,
    name: React.PropTypes.string,
    onBlur: React.PropTypes.func,
    onClick: React.PropTypes.func,
    onContract: React.PropTypes.func,
    onCopy: React.PropTypes.func,
    onCut: React.PropTypes.func,
    onExpand: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    onKeyPress: React.PropTypes.func,
    onKeyUp: React.PropTypes.func,
    onPaste: React.PropTypes.func,
    stack: React.PropTypes.string
  },
  getDefaultProps: function () {
    return {
      expanded: false
    };
  },

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      menu = [];
    let contents = [],
      firstLine = [];

    if (props.name) {
      firstLine.push(props.name);
    }

    if (props.message) {
      firstLine.push(props.message);
    }

    if (firstLine) {
      contents.push(<div key="firstLine">{firstLine.join(': ')}</div>);
    }

    if (props.stack) {
      contents.push(<div key="stack">{props.stack}</div>);
    }

    className.push('font-monospaced');

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
        <header>{'postgresql error'}</header>
        <div className="postgresql-error-block__menu">
          {menu}
        </div>
        <div className="postgresql-error-block__contents-outer">
          <div className="postgresql-error-block__contents">{contents}</div>
        </div>
      </section>
    );
  }
});
