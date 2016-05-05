import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import _ from 'lodash';

let message = `
IPython -- An enhanced Interactive Python.
?         -> Introduction and overview of IPython's features.
%quickref -> Quick reference.
help      -> Python's own help system.
object?   -> Details about 'object', use 'object??' for extra details.
`;

export default React.createClass({
  displayName: 'Terminal',
  propTypes: {
    id: React.PropTypes.string,
    indentWidth: React.PropTypes.number,
    message: React.PropTypes.string,
    onAutoComplete: React.PropTypes.func,
    onCommand: React.PropTypes.func
  },
  getDefaultProps: function () {
    return {
      indentWidth: 4,
      message,
      onAutoComplete: _.noop,
      onCommand: _.noop
    };
  },
  componentDidMount: function () {
    const jqConsole = $(ReactDOM.findDOMNode(this)).jqconsole(this.props.message, '>>> ');

    // 4 spaces for python
    jqConsole.SetIndentWidth(this.props.indentWidth);

    // autocomplete
    jqConsole._IndentOld = jqConsole._Indent;
    jqConsole._Indent = function () {
      const onAutoComplete = this.props.onAutoComplete;

      if (jqConsole.GetPromptText().trim() == '') {
        jqConsole._IndentOld();
      } else if (jqConsole.GetPromptText().slice(-1) == '\n') {
        jqConsole._IndentOld();
      } else {
        let code = jqConsole.GetPromptText();

        code = code.slice(0, jqConsole.GetColumn() - 4);

        jqConsole.ClearPromptText(true);

        // ???
        if (onAutoComplete) {
          onAutoComplete(code); // ???
        }

        // executeCommand(code, true, handleExecuteCommand(originalPrompt, code));
      }
    }.bind(this);

    this.jqConsole = jqConsole;
    this.startPrompt();
  },
  startPrompt: function () {
    console.log('startPrompt', this, arguments);
    const jqConsole = this.jqConsole,
      id = this.props.id;

    jqConsole.Prompt(true, function (input) {
      const onCommand = this.props.onCommand;

      if (onCommand) {
        onCommand(input, id);
      }

      setTimeout(this.startPrompt, 0);
    }.bind(this));
  },
  render: function () {
    return <div className="terminal" id={this.props.id}></div>;
  }
});