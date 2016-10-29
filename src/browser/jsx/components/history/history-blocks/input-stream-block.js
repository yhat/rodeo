/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';
import './input-stream-block.css';

export default React.createClass({
  displayName: 'InputStreamBlock',
  propTypes: {
    expanded: React.PropTypes.bool,
    lines: React.PropTypes.array,
    onBlur: React.PropTypes.func,
    onClick: React.PropTypes.func,
    onContract: React.PropTypes.func,
    onCopy: React.PropTypes.func,
    onCopyToPrompt: React.PropTypes.func,
    onCut: React.PropTypes.func,
    onExpand: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    onKeyPress: React.PropTypes.func,
    onKeyUp: React.PropTypes.func,
    onPaste: React.PropTypes.func,
    onReRun: React.PropTypes.func,
    previewCount: React.PropTypes.number
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
      lines = props.lines,
      previewCount = props.previewCount || 4,
      getLine = (line, index) => <div className="input-stream-block-line" id={index} key={index}>{line}</div>,
      menu = [
        <span
          className="fa fa-arrow-down"
          onClick={props.onCopyToPrompt}
          title="Copy To Prompt"
        />,
        <span
          className="fa fa-refresh"
          onClick={props.onReRun}
          title="Re-run"
        />
      ];
    let contents;

    className.push('font-monospaced');

    if (props.expanded) {
      className.push('input-stream-block--expanded');
      menu.push(<span className="fa fa-contract" key="contract" onClick={props.onContract} title="Contract"/>);
      contents = lines.map(getLine);
    } else {
      const len = Math.max(lines.length - previewCount, 0);

      contents = [];
      for (let i = lines.length - 1; i >= len; i--) {
        contents.unshift(getLine(lines[i], i));
      }

      menu.push(<span className="fa fa-expand" key="expand" onClick={props.onExpand} title="Expand"/>);

      className.push('input-stream-block--compressed');
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
      ><header>{'input'}</header><div className="input-stream-block__menu">{menu}</div>{contents}</section>
    );
  }
});
