import React from 'react';
import commonReact from '../../services/common-react';
import './prompt.css';

export default React.createClass({
  displayName: 'Prompt',
  propTypes: {
    continueLabel: React.PropTypes.string,
    cursor: React.PropTypes.object,
    lines: React.PropTypes.array,
    onBlur: React.PropTypes.func,
    onClick: React.PropTypes.func,
    onCopy: React.PropTypes.func,
    onCut: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    onKeyPress: React.PropTypes.func,
    onKeyUp: React.PropTypes.func,
    onPaste: React.PropTypes.func,
    promptLabel: React.PropTypes.string,
    showPrompt: React.PropTypes.bool,
    tabIndex: React.PropTypes.number
  },
  getDefaultProps: function () {
    return {
      lines: [],
      cursor: {row: 0, column: 0},
      promptLabel: '>>> ',
      continueLabel: '... '
    };
  },

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    function getLine(line, index) {
      let content;

      if (props.cursor.row === index) {
        content = [
          line.substr(0, props.cursor.column),
          <span className="prompt-cursor" key="promptCursor">&nbsp;</span>,
          line.substr(props.cursor.column)
        ];
      } else {
        content = [line];
      }

      if (props.showPrompt !== false) {
        if (index === 0) {
          content.unshift(<span className="prompt--prompt" key="promptLabel">{props.promptLabel}</span>);
        } else {
          content.unshift(<span className="prompt--continue" key="promptContinue">{props.continueLabel}</span>);
        }
      }

      return <div className="prompt-line" key={index}>{content}</div>;
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
      >{props.lines.map(getLine)}</div>
    );
  }
});
