import _ from 'lodash';
import React from 'react';
import Prompt from '../../components/prompt/prompt';
import commonReact from '../../services/common-react';
import promptActions from '../../services/prompt-actions';

const keyDownCommands = [
    {key: 'Meta', fn: _.noop},
    {key: 'Shift', fn: _.noop},
    {key: 'Control', fn: _.noop},
    {key: 'ArrowLeft', alt: false, meta: false, shift: false, ctrl: false, fn: promptActions.moveLeft},
    {key: 'ArrowRight', alt: false, meta: false, shift: false, ctrl: false, fn: promptActions.moveRight},
    {key: 'ArrowUp', alt: false, meta: false, shift: false, ctrl: false, fn: promptActions.moveUp},
    {key: 'ArrowDown', alt: false, meta: false, shift: false, ctrl: false, fn: promptActions.moveDown},
    {key: 'ArrowLeft', alt: true, meta: false, shift: false, ctrl: false, fn: promptActions.moveToPrecedingWord},
    {key: 'ArrowRight', alt: true, meta: false, shift: false, ctrl: false, fn: promptActions.moveToFollowingWord},
    {key: 'ArrowLeft', alt: false, meta: false, shift: false, ctrl: true, fn: promptActions.moveToBeginningLine},
    {key: 'ArrowRight', alt: false, meta: false, shift: false, ctrl: true, fn: promptActions.moveToEndLine},
    {key: 'ArrowLeft', alt: false, meta: true, shift: false, ctrl: false, fn: promptActions.moveToBeginningLine},
    {key: 'ArrowRight', alt: false, meta: true, shift: false, ctrl: false, fn: promptActions.moveToEndLine},
    {key: 'Backspace', alt: false, meta: false, shift: false, ctrl: false, fn: promptActions.backspace},
    {key: 'Backspace', alt: false, meta: false, shift: false, ctrl: true, fn: promptActions.removePreviousWord},
    {key: 'Backspace', alt: false, meta: true, shift: false, ctrl: false, fn: promptActions.removePreviousWord},
    {key: 'Delete', alt: false, meta: false, shift: false, ctrl: false, fn: promptActions.deleteSpecial},
    {key: 'Delete', alt: false, meta: false, shift: false, ctrl: true, fn: promptActions.removeNextWord},
    {key: 'Delete', alt: false, meta: true, shift: false, ctrl: false, fn: promptActions.removeNextWord},
    {key: 'Enter', alt: false, meta: true, shift: false, ctrl: false, fn: promptActions.breakLine},
    {key: 'Enter', alt: false, meta: false, shift: true, ctrl: false, fn: promptActions.breakLine},
    {key: 'c', alt: false, meta: false, shift: false, ctrl: true, fn: promptActions.clear}
  ],
  keyPressCommands = [
    {key: 'Meta', fn: _.noop},
    {key: 'Shift', fn: _.noop},
    {key: 'Control', fn: _.noop},
    {key: 'Enter', alt: false, meta: false, shift: false, ctrl: false, fn: promptActions.execute},
    {key: 'Backspace', alt: false, meta: false, shift: false, ctrl: false, fn: promptActions.backspace}
  ];

export default React.createClass({
  displayName: 'PromptViewer',
  propTypes: {
    indentWidth: React.PropTypes.number
  },

  getInitialState: function () {
    return {
      lines: [''],
      cursor: {row: 0, column: 0},
      queue: [],
      state: 'paused', // paused, prompt, busy, input
      focused: false
    };
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    return commonReact.shouldComponentUpdate(this, nextProps, nextState);
  },

  handleFocus: function () {
    this.setState({focused: true});
  },

  handleBlur: function () {
    this.setState({focused: false});
  },

  handleKeyDown: function (event) {
    const key = event.key,
      alt = event.altKey,
      ctrl = event.ctrlKey,
      meta = event.metaKey,
      shift = event.shiftKey,
      targetCommand = {key, alt, meta, ctrl, shift},
      matches = _.matches(targetCommand),
      command = _.find(keyDownCommands, matches);

    console.log('keyDown', {key, command, targetCommand});

    if (command) {
      event.preventDefault();
      event.stopPropagation();
      this.setState(command.fn(this.state, event));
    }
  },
  /**
   *
   * @param {KeyboardEvent} event
   */
  handleKeyPress: function (event) {
    event.preventDefault();
    event.stopPropagation();

    const key = event.key,
      alt = event.altKey,
      ctrl = event.ctrlKey,
      meta = event.metaKey,
      shift = event.shiftKey,
      targetCommand = {key, alt, meta, ctrl, shift},
      matches = _.matches(targetCommand),
      command = _.find(keyPressCommands, matches);

    console.log('keyPress', {key, command, targetCommand});

    if (command) {
      if (command.fn === promptActions.execute) {
        this.props.onExecute(_.clone(this.state));
      }

      this.setState(command.fn(this.state, event));
    } else if (key && key.length === 1) {
      this.setState(promptActions.insertKey(this.state, event));
    }
  },

  handlePaste: function (event) {
    this.setState(promptActions.paste(this.state, event));
  },

  handleCopy: function (event) {
    this.setState(promptActions.copy(this.state, event));
  },

  handleCut: function (event) {
    this.setState(promptActions.cut(this.state, event));
  },

  handleClick: function (event) {
    this.setState(promptActions.moveToClick(this.state, event));
  },

  render() {
    const props = this.props,
      state = this.state,
      className = commonReact.getClassNameList(this);

    if (this.state.focused) {
      className.push('focused');
    }

    return (
      <Prompt
        className={className.join(' ')}
        {...props}
        {...state}
        onBlur={this.handleBlur}
        onClick={this.handleClick}
        onCopy={this.handleCopy}
        onCut={this.handleCut}
        onFocus={this.handleFocus}
        onKeyDown={this.handleKeyDown}
        onKeyPress={this.handleKeyPress}
        onPaste={this.handlePaste}
      />
    );
  }
});
