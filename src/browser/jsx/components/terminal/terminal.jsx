import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import './lib/jqconsole.min';

let message = `
IPython -- An enhanced Interactive Python.
?         -> Introduction and overview of IPython's features.
%quickref -> Quick reference.
help      -> Python's own help system.
object?   -> Details about 'object', use 'object??' for extra details.
`;

/**
 * @class Terminal
 * @extends ReactComponent
 * @property props
 */
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
      message: message,
      onAutoComplete: _.noop,
      onCommand: _.noop
    };
  },
  componentDidMount: function () {
    const props = this.props,
      jqConsole = $(ReactDOM.findDOMNode(this)).jqconsole(props.message, '>>> ');

    jqConsole.SetIndentWidth(this.props.indentWidth);

    // autocomplete
    jqConsole._IndentOld = jqConsole._Indent;
    jqConsole._Indent = () => {
      const onAutoComplete = props.onAutoComplete;

      if (jqConsole.GetPromptText().trim() == '') {
        jqConsole._IndentOld();
      } else if (jqConsole.GetPromptText().slice(-1) == '\n') {
        jqConsole._IndentOld();
      } else {
        let code = jqConsole.GetPromptText();

        code = code.slice(0, jqConsole.GetColumn() - 4);
        jqConsole.ClearPromptText(true);
        onAutoComplete(code); // ???

        // executeCommand(code, true, handleExecuteCommand(originalPrompt, code));
      }
    };

    this.jqConsole = jqConsole;
    this.startPrompt();
  },
  startPrompt: function () {
    const jqConsole = this.jqConsole,
      props = this.props,
      id = props.id,
      nextPrompt = () => _.defer(this.startPrompt);

    jqConsole.Prompt(true, (input) => {
      let result = props.onCommand(input, id);

      if (result && _.isFunction(result.then)) {
        return result.then(nextPrompt)
          .catch(function (error) {
            console.error(error);
            nextPrompt();
          });
      } else {
        nextPrompt();
      }
    });
  },
  render: function () {
    return <div className="terminal" id={this.props.id}></div>;
  }
});
