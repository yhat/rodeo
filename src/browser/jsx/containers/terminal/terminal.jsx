import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import './lib/jqconsole.js';
import './terminal.css';
import terminalShortcuts from '../../services/terminal-shortcuts';

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
    focusable: React.PropTypes.bool,
    fontSize: React.PropTypes.number,
    id: React.PropTypes.string,
    indentWidth: React.PropTypes.number,
    message: React.PropTypes.string,
    onAutoComplete: React.PropTypes.func,
    onStart: React.PropTypes.func
  },
  getDefaultProps: function () {
    return {
      focusable: true,
      fontSize: 12,
      indentWidth: 4,
      message: message,
      onAutoComplete: _.noop,
      onInterrupt: _.noop,
      onStart: _.noop
    };
  },
  componentDidMount: function () {
    const props = this.props,
      disableAutoFocus = true, // don't steal focus from other hard-working components
      el = ReactDOM.findDOMNode(this),
      jqConsole = $(el).jqconsole(props.message, '>>> ', '... ', disableAutoFocus);

    jqConsole.SetIndentWidth(this.props.indentWidth);

    terminalShortcuts.autoComplete(jqConsole, props.onAutoComplete);
    terminalShortcuts.clearBuffer(jqConsole, el);
    terminalShortcuts.clearPrompt(jqConsole);
    terminalShortcuts.interrupt(jqConsole, el, props.onInterrupt);
    terminalShortcuts.moveCursorToEnd(jqConsole);
    terminalShortcuts.moveCursorToStart(jqConsole);

    props.onStart(jqConsole);
  },
  render: function () {
    const props = this.props,
      style = {
        fontSize: props.fontSize + 'px'
      };

    return <div className="terminal" id={props.id} style={style}></div>;
  }
});
