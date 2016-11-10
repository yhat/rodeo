/**
 * Represents output from standard out or standard error or other sources.
 *
 * Marked as different sources.  Should support ANSI colors.
 */

import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import commonReact from '../../../services/common-react';
import './input-stream-block.css';
import ExpandBlockButton from '../expand-block-button';
import selectionUtil from '../../../services/selection-util';

export default React.createClass({
  displayName: 'InputStreamBlock',
  propTypes: {
    expanded: React.PropTypes.bool,
    language: React.PropTypes.string,
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
    onReRun: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      lines: [],
      expanded: false
    };
  },

  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  handleClick(event) {
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

  handleDoubleClick(event) {
    event.preventDefault();
    const props = this.props;

    if (props.expanded) {
      props.onContract(event);
    } else {
      props.onExpand(event);
    }
  },

  handleCopy(event) {
    const props = this.props,
      text = props.lines.join('\n');

    event.preventDefault();
    event.clipboardData.setData('text/plain', text);
  },

  handleCopyButton() {
    const el = ReactDOM.findDOMNode(this);

    selectionUtil.copy(el);
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      lines = props.lines,
      getLine = (line, index) => <div className="input-stream-block-line" id={index} key={index}>{line}</div>,
      menu = [];
    let expandButton, contents;

    menu.push(<span className="fa fa-copy" key="copy" onClick={this.handleCopyButton} title="Copy"/>);

    if (props.allowCopyToPrompt) {
      menu.unshift(
        <span
          className="fa fa-arrow-down"
          onClick={_.partial(props.onCopyToPrompt, _.clone(props))}
          title="Copy To Prompt"
        />
      );
    }

    if (props.allowReRun) {
      menu.unshift(
        <span
          className="fa fa-refresh"
          onClick={props.onReRun}
          title="Re-run"
        />
      );
    }

    className.push('font-monospaced');

    if (lines.length > 1) {
      if (props.expanded || lines.length < 2) {
        className.push('input-stream-block--expanded');
        menu.push(<span className="fa fa-compress" key="contract" onClick={props.onContract} title="Contract"/>);
        contents = lines.map(getLine);
      } else {
        contents = _.map(_.takeRight(lines, 2), getLine);

        menu.push(<span className="fa fa-expand" key="expand" onClick={props.onExpand} title="Expand"/>);
        className.push('input-stream-block--compressed');
      }

      expandButton = (
        <ExpandBlockButton
          direction={props.expanded ? 'up' : 'down'}
          onClick={props.expanded ? props.onContract : props.onExpand}
        />
      );
    } else {
      contents = lines.map(getLine);
    }

    return (
      <section
        className={className.join(' ')}
        onBlur={props.onBlur}
        onClick={this.handleClick}
        onCopy={this.handleCopy}
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
          {'input'}
          <div className="input-stream-block__menu">{menu}</div>
        </header>
        <div className="input-stream-block__contents-outer">
          <div className="input-stream-block__contents">{contents}</div>
        </div>
        {expandButton}
      </section>
    );
  }
});
