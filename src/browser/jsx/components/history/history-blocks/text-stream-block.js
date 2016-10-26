/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import React from 'react';
import commonReact from '../../../services/common-react';

export default React.createClass({
  displayName: 'TextStreamBlock',
  propTypes: {
    chunks: React.PropTypes.object,
    expanded: React.PropTypes.bool,
    previewCount: React.PropTypes.number,
    onBlur: React.PropTypes.func,
    onContract: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onExpand: React.PropTypes.func,
    onKeyPress: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    onKeyUp: React.PropTypes.func,
    onPaste: React.PropTypes.func,
    onCopy: React.PropTypes.func,
    onCut: React.PropTypes.func,
    onClick: React.PropTypes.func
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
      chunks = props.chunks,
      previewCount = props.previewCount || 4;
    let contents;

    function getChunk(chunk) {
      const className = ['yhat-text-stream-block-chunk'];

      if (chunk.source) {
        className.push(chunk.source);
      }

      return <span className={className.join(' ')} key={chunk.id} id={chunk.id}>{chunk.buffer}</span>;
    }

    if (props.expanded) {
      className.push('yhat-text-stream-block--expanded');
      contents = props.chunks.map(getChunk);
    } else {
      contents = [];
      for (let i = chunks.length - 1; i >= chunks.length - previewCount; i--) {
        contents.unshift(getChunk(chunks[i]));
      }

      contents.unshift(<div className="yhat-text-stream-expander" onClick={props.onExpand}>{'(...)'}</div>);
      className.push('yhat-text-stream-block--compressed');
    }

    return (
      <div
        className={className.join(' ')}
        tabIndex={props.tabIndex || 0}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onKeyPress={props.onKeyPress}
        onKeyDown={props.onKeyDown}
        onKeyUp={props.onKeyUp}
        onPaste={props.onPaste}
        onCopy={props.onCopy}
        onCut={props.onCut}
        onClick={props.onClick}
      >{contents}</div>
    );
  }
});
