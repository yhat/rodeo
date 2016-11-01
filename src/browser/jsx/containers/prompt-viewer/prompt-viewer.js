import _ from 'lodash';
import React from 'react';
import Prompt from '../../components/prompt/prompt';
import commonReact from '../../services/common-react';
import commands from './default-commands.yml';
import promptUtils from '../../services/util/prompt-util';

export default React.createClass({
  displayName: 'PromptViewer',
  propTypes: {
    onBlur: React.PropTypes.func,
    onCommand: React.PropTypes.func.isRequired,
    onExecute: React.PropTypes.func.isRequired,
    onFocus: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      lines: [''],
      cursor: {row: 0, column: 0},
      queue: [],
      state: 'paused', // paused, prompt, busy, input
      focused: false
    };
  },

  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  handleKeyDown: function (event) {
    const props = this.props,
      key = event.key,
      alt = event.altKey,
      ctrl = event.ctrlKey,
      meta = event.metaKey,
      shift = event.shiftKey,
      targetCommand = {key, alt, meta, ctrl, shift},
      matches = _.matches(targetCommand),
      command = _.find(commands.keyDown, matches);

    if (command) {
      event.preventDefault();
      event.stopPropagation();
      props.onCommand(command);
    }
  },
  /**
   *
   * @param {KeyboardEvent} event
   */
  handleKeyPress: function (event) {
    event.preventDefault();
    event.stopPropagation();

    const props = this.props,
      key = event.key,
      alt = event.altKey,
      ctrl = event.ctrlKey,
      meta = event.metaKey,
      shift = event.shiftKey,
      targetCommand = {key, alt, meta, ctrl, shift},
      matches = _.matches(targetCommand),
      command = _.find(commands.keyPress, matches);

    if (command) {
      if (command.name === 'execute') {
        props.onExecute(_.clone(props));
      }

      props.onCommand(command);
    } else if (key && key.length === 1) {
      props.onCommand({name: 'insertKey', key});
    }
  },

  handlePaste: function (event) {
    event.preventDefault();
    const text = event.clipboardData.getData('text');
    let command = {};

    if (text) {
      const textSplit = text.split('\n');

      if (textSplit.length === 1) {
        command = {name: 'insertSingleLineText', text};
      } else {
        command = {name: 'insertMultiLineText', text};
      }
    }

    window.getSelection().collapseToStart();
    this.props.onCommand(command);
  },

  /**
   * NOTE: No state change, so no need to create action/reducers
   * @param {Event} event
   */
  handleCopy: function (event) {
    event.preventDefault();
    const text = promptUtils.getSelectedText(promptUtils.getSelection(event));

    if (text) {
      event.clipboardData.setData('text', text);
    }
  },

  /**
   * @param {Event} event
   */
  handleCut: function (event) {
    event.preventDefault();
    const selection = promptUtils.getSelection(event),
      text = promptUtils.getSelectedText(selection);

    window.getSelection().collapseToStart();
    event.clipboardData.setData('text', text);
    this.props.onCommand({name: 'removeSelection', selection, text});
  },

  handleClick: function (event) {
    const cursor = promptUtils.getCursorOfClick(event);

    if (cursor) {
      this.props.onCommand({name: 'move', cursor});
    }
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    if (props.focused) {
      className.push('focused');
    }

    return (
      <Prompt
        className={className.join(' ')}
        {...props}
        onBlur={props.onBlur}
        onClick={this.handleClick}
        onCopy={this.handleCopy}
        onCut={this.handleCut}
        onFocus={props.onFocus}
        onKeyDown={this.handleKeyDown}
        onKeyPress={this.handleKeyPress}
        onPaste={this.handlePaste}
      />
    );
  }
});
