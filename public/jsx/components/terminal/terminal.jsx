import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

export default React.createClass({
  displayName: 'Terminal',
  propTypes: {
    indentWidth: React.PropTypes.number,
    message: React.PropTypes.string,
    onAutoComplete: React.PropTypes.func,
    onCommand: React.PropTypes.func
  },
  componentDidMount: function () {
    const jqConsole = $(ReactDOM.findDOMNode(this)).jqconsole(this.props.message, '>>> ');

    // 4 spaces for python
    jqConsole.SetIndentWidth(this.props.indentWidth || 4);

    // autocomplete
    jqConsole._IndentOld = jqConsole._Indent;
    jqConsole._Indent = function () {
      const onAutoComplete = this.props.onAutoComplete;

      if (jqConsole.GetPromptText().trim() == '') {
        jqConsole._IndentOld();
      } else if (jqConsole.GetPromptText().slice(-1) == '\n') {
        jqConsole._IndentOld();
      } else {
        let originalPrompt = jqConsole.GetPromptText(),
          code = jqConsole.GetPromptText();

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
    const jqConsole = this.jqConsole;

    jqConsole.Prompt(true, function (input) {
      const onCommand = this.props.onCommand;

      if (onCommand) {
        onCommand(input);
      }

      setTimeout(this.startPrompt, 0);
    }.bind(this));
  },
  render: function () {
    return <div></div>;
  }
});