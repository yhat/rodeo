import _ from 'lodash';
import React from 'react';
import commonReact from '../../services/common-react';
import './prompt.css';

function getStars(isStars, str) {
  return !isStars && str || _.repeat('*', str.length);
}

export default React.createClass({
  displayName: 'Prompt',
  propTypes: {
    continueLabel: React.PropTypes.string,
    cursor: React.PropTypes.object,
    cursorType: React.PropTypes.string,
    inputPrompt: React.PropTypes.object,
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
      cursorType: 'solidBlock',
      promptLabel: '>>> ',
      continueLabel: '... '
    };
  },

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      isPassword = _.get(props, 'inputPrompt.password');

    function getLine(line, index) {
      let content;

      if (props.cursor.row === index) {
        const cursorClassName = ['prompt__cursor', 'prompt__cursor--' + props.cursorType];

        content = [
          getStars(isPassword, line.substr(0, props.cursor.column)),
          <span className={cursorClassName.join(' ')} key="promptCursor">&nbsp;</span>,
          getStars(isPassword, line.substr(props.cursor.column))
        ];
      } else {
        content = [getStars(isPassword, line)];
      }

      if (props.inputPrompt && props.inputPrompt.prompt) {
        if (index === 0) {
          content.unshift(<span className="prompt--prompt" key="promptLabel">{props.inputPrompt.prompt}</span>);
        }
      } else if (props.showPrompt !== false) {
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
