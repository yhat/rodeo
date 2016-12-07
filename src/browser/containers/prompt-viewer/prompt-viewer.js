import _ from 'lodash';
import React from 'react';
import Prompt from '../../components/prompt/prompt';
import commonReact from '../../services/common-react';
import client from '../../services/jupyter/client';
import promptUtils from '../../services/util/prompt-util';
import textUtil from '../../services/text-util';
import defaultCommands from './default-commands.yml';

function getTargetCommand(event) {
  const key = event.key,
    alt = event.altKey,
    ctrl = event.ctrlKey,
    meta = event.metaKey,
    shift = event.shiftKey,
    selection = promptUtils.getSelectionLength(event) !== 0;

  return {key, alt, meta, ctrl, shift, selection};
}

/**
 *
 * @param {Array} commands
 * @param {object} targetCommand
 * @returns {Array}
 */
function getKeyDownCommands(commands, targetCommand) {
  const matches = _.matches(targetCommand),
    byOS = commands.keyDownByOS[process.platform];
  let keyDownCommands = commands.keyDown.filter(matches);

  if (byOS) {
    keyDownCommands = byOS.filter(matches).concat(keyDownCommands);
  }

  return keyDownCommands;
}

function getKeyPressCommands(commands, targetCommand) {
  const matches = _.matches(targetCommand);

  return commands.keyPress.filter(matches);
}

export default React.createClass({
  displayName: 'PromptViewer',
  propTypes: {
    onAutocomplete: React.PropTypes.func.isRequired,
    onBlur: React.PropTypes.func,
    onCommand: React.PropTypes.func.isRequired,
    onExecute: React.PropTypes.func.isRequired,
    onFocus: React.PropTypes.func,
    onInput: React.PropTypes.func.isRequired
  },

  getDefaultProps: function () {
    return {
      focusable: true,
      lines: [''],
      cursor: {row: 0, column: 0},
      queue: [],
      state: 'paused'
    };
  },

  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },

  shouldAutocomplete() {
    const props = this.props,
      currentLine = props.lines[props.cursor.row],
      trimmedStartCurrentLine = _.trimStart(currentLine);

    // if blank line, don't autocomplete
    return trimmedStartCurrentLine.length !== 0;
  },

  autocomplete() {
    const props = this.props,
      cursor = props.cursor,
      code = props.lines.join('\n');

    this.isComplete().catch(error => console.error(error));

    return client.getAutoComplete(code, textUtil.getCursorPosFromRowColumn(code, cursor.row, cursor.column)).then(function (result) {
      const matches = result.matches;

      if (matches.length === 1) {
        const start = result.cursor_start,
          len = result.cursor_end - start,
          newCode = textUtil.spliceString(code, start, len, matches[0]),
          lines = newCode.split('\n'),
          cursor = textUtil.getRowColumnFromCursorPos(newCode, result.cursor_start + matches[0].length);

        // if only a single match, just replace it
        return props.onCommand({
          name: 'move',
          lines,
          clearAutocomplete: true,
          cursor
        });
      } else if (matches.length > 0) {
        return props.onAutocomplete(matches);
      }
    });
  },

  isComplete() {
    const props = this.props,
      code = props.lines.join('\n');

    return client.isComplete(code);
  },

  /**
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    const props = this.props,
      targetCommand = getTargetCommand(event),
      matchingCommands = getKeyDownCommands(defaultCommands, targetCommand);

    if (matchingCommands[0]) {
      let command = matchingCommands[0];

      if (command.name === 'autocomplete') {
        if (this.shouldAutocomplete()) {
          event.preventDefault();
          if (command.stopPropagation !== false) {
            event.stopPropagation();
          }
          this.autocomplete();
        } else {
          // next please
          matchingCommands.shift();
          command = matchingCommands[0];
        }
      }

      if (command) {
        event.preventDefault();
        if (command.stopPropagation !== false) {
          event.stopPropagation();
        }

        props.onCommand(command);
      }
    }
  },
  /**
   * @param {KeyboardEvent} event
   */
  handleKeyPress(event) {
    const props = this.props,
      key = event.key,
      targetCommand = getTargetCommand(event),
      matchingCommands = getKeyPressCommands(defaultCommands, targetCommand),
      command = matchingCommands[0];

    if (command) {
      // if one of our commands
      event.preventDefault();
      event.stopPropagation();

      if (command.name === 'execute') {
        const text = props.lines.join('\n');

        if (props.inputPrompt) {
          const context = _.clone(props);

          context.text = text;
          props.onInput({text});
        } else {
          this.isComplete(text).then(function (result) {
            const status = result.status,
              indent = result.indent;

            if (status === 'incomplete' && _.isString(result.indent)) {
              props.onCommand({name: 'insertMultiLineText', text: '\n' + indent});
            } else {
              const context = _.clone(props);

              context.text = text;
              props.onExecute({text});
            }
          }).catch(error => console.error(error));
        }
      } else {
        props.onCommand(command);
      }
    } else if (key && key.length === 1) {
      // if they held down keys, they're trying to do a command of some other component, not typing
      event.preventDefault();
      event.stopPropagation();

      props.onCommand({name: 'insertKey', key});
    }
  },

  handlePaste(event) {
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
  handleCopy(event) {
    event.preventDefault();
    const text = promptUtils.getSelectedText(promptUtils.getSelection(event));

    if (text) {
      event.clipboardData.setData('text', text);
    }
  },

  /**
   * @param {Event} event
   */
  handleCut(event) {
    event.preventDefault();
    const selection = promptUtils.getSelection(event),
      text = promptUtils.getSelectedText(selection);

    window.getSelection().collapseToStart();
    event.clipboardData.setData('text', text);
    this.props.onCommand({name: 'removeSelection', selection, text});
  },

  handleClick(event) {
    const cursor = promptUtils.getCursorOfClick(event);

    if (cursor) {
      this.props.onCommand({name: 'move', cursor});
    }
  },

  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this);

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
