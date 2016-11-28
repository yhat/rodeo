/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import _ from 'lodash';
import React from 'react';
import commonReact from '../../../services/common-react';
import textUtil from '../../../services/text-util';
import './text-stream-block.css';
import ExpandBlockButton from '../expand-block-button';

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

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  handleClick: function (event) {
    event.preventDefault();
    const props = this.props;

    if (props.expanded) {
      if (!this.clickTimer) {
        this.clickTimer = setTimeout(() => {
          this.clickTimer = null;
          if (props.onClick) {
            props.onClick();
          }
        }, 250);
      } else {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
      }
    }
  },

  handleDoubleClick: function (event) {
    event.preventDefault();
    const props = this.props;

    if (props.expanded) {
      props.onContract(event);
    } else {
      props.onExpand(event);
    }
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      chunks = props.chunks,
      previewCount = props.previewCount || 2,
      menu = [],
      converter = textUtil.getAsciiToHtmlStream();
    let contents, expandButton;

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

      buffer = converter.toHtml(buffer);

      if (chunk.source) {
        className.push(chunk.source);
      }

      /* eslint react/no-danger: 0 */
      return <span className={className.join(' ')} dangerouslySetInnerHTML={{__html: buffer}} id={chunk.id} key={chunk.id} />;
    }


    if (chunks.length > 1) {
      if (props.expanded) {
        className.push('text-stream-block--expanded');
        menu.push(<span className="fa fa-compress" key="contract" onClick={props.onContract}/>);
        contents = props.chunks.map(getChunk);
      } else {
        menu.push(<span className="fa fa-expand" key="expand" onClick={props.onExpand}/>);
        className.push('text-stream-block--compressed');
        contents = _.map(_.takeRight(chunks, previewCount), getChunk);
      }

      expandButton = (
        <ExpandBlockButton
          direction={props.expanded ? 'up' : 'down'}
          onClick={props.expanded ? props.onContract : props.onExpand}
        />
      );
    } else {
      contents = props.chunks.map(getChunk);
    }

    return (
      <section
        className={className.join(' ')}
        onBlur={props.onBlur}
        onClick={this.handleClick}
        onCopy={props.onCopy}
        onCut={props.onCut}
        onDoubleClick={this.handleDoubleClick}
        onFocus={props.onFocus}
        onKeyDown={props.onKeyDown}
        onKeyPress={props.onKeyPress}
        onKeyUp={props.onKeyUp}
        onPaste={props.onPaste}
        tabIndex={props.tabIndex || 0}
      >
        <header>
          {'text'}
          <div className="text-stream-block__menu">{menu}</div>
        </header>

        <div className="text-stream-block__contents-outer">
          <div className="text-stream-block__contents">{contents}</div>
        </div>
        {expandButton}
      </section>
    );
  }
});
