import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import './lib/jqconsole.js';

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
    fontSize: React.PropTypes.number,
    id: React.PropTypes.string,
    indentWidth: React.PropTypes.number,
    message: React.PropTypes.string,
    onAutoComplete: React.PropTypes.func,
    onStart: React.PropTypes.func
  },
  getDefaultProps: function () {
    return {
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
        onAutoComplete(code);
      }
    };

    /**
     * If no prompt or input, the console doesn't receive events.
     *
     * We have to do it then.
     * @param {KeyboardEvent} event
     */
    el.addEventListener('keydown', function (event) {
      if (
        (event.ctrlKey === true) &&
        (event.code === 'KeyC' || event.keyCode === 67) &&
        (jqConsole.GetState() !== 'prompt')
      ) {
        props.onInterrupt();
      }
    });

    jqConsole.RegisterShortcut('c', function () {
      jqConsole.ClearPromptText();
    });

    jqConsole.RegisterShortcut('l', function () {
      jqConsole.Clear();
      const extras = el.querySelectorAll('img,iframe');

      _.each(extras, function (extra) {
        const parent = extra.parentNode;

        console.log('removing', extra, parent);

        parent.removeChild(extra);
      });
    });

    jqConsole.RegisterShortcut('a', function () {
      jqConsole.MoveToStart();
    });

    jqConsole.RegisterShortcut('e', function () {
      jqConsole.MoveToEnd();
    });


    props.onStart(jqConsole);
  },
  render: function () {
    const style = {
      fontSize: this.props.fontSize + 'px'
    };

    return <div className="terminal" id={this.props.id} style={style}></div>;
  }
});
