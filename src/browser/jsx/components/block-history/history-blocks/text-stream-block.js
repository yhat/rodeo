/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';
import './text-stream-block.css';
import ExpandBlockButton from '../expand-block-button';
import AsciiToHtml from 'ansi-to-html';

export default React.createClass({
  displayName: 'TextStreamBlock',
  propTypes: {
    chunks: React.PropTypes.array,
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

  componentWillMount() {
    // just for this component's use, so streaming colors works
    this.asciiToHtmlConvertor = new AsciiToHtml({stream: true});
  },

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      chunks = props.chunks,
      previewCount = props.previewCount || 2,
      menu = [],
      convertor = this.asciiToHtmlConvertor;
    let contents;

    className.push('font-monospaced');

    function getChunk(chunk, index, list) {
      const className = ['text-stream-block-chunk'];
      let buffer = chunk.buffer;

      if (index === 0) {
        buffer = _.trimStart(buffer);
      }

      if (index === list.length - 1) {
        buffer = _.trimEnd(buffer);
      }

      buffer = convertor.toHtml(buffer);

      if (chunk.source) {
        className.push(chunk.source);
      }

      /* eslint react/no-danger: 0 */
      return <span className={className.join(' ')} dangerouslySetInnerHTML={{__html: buffer}} id={chunk.id} key={chunk.id} />;
    }

    if (props.expanded || chunks.length < 2) {
      className.push('text-stream-block--expanded');
      menu.push(<span className="fa fa-compress" key="contract" onClick={props.onContract}/>);
      contents = props.chunks.map(getChunk);
    } else {
      contents = _.map(_.takeRight(chunks, previewCount), getChunk);

      menu.push(<span className="fa fa-expand" key="expand" onClick={props.onExpand}/>);

      className.push('text-stream-block--compressed');
    }

    return (
      <div
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
      ><header>{'text'}</header>
        <div className="text-stream-block__menu">{menu}</div>
        <div className="text-stream-block__contents-outer">
          <div className="text-stream-block__contents">{contents}</div>
        </div>
        <ExpandBlockButton
          direction={props.expanded ? 'up' : 'down'}
          onClick={props.expanded ? props.onContract : props.onExpand}
        />
      </div>
    );
  }
});
