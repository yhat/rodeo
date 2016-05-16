import React from 'react';
import ReactDOM from 'react-dom';
import ace from 'ace';
import './ace-pane.less';
import _ from 'lodash';
import { send } from '../../services/ipc';
import pythonCompleter from '../../services/python-completer';

/**
 * @class AcePane
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'AcePane',
  propTypes: {
    disabled: React.PropTypes.bool,
    filename: React.PropTypes.string,
    fontSize: React.PropTypes.number,
    highlightLine: React.PropTypes.bool,
    id: React.PropTypes.string,
    keyBindings: React.PropTypes.string,
    mode: React.PropTypes.string,
    onLoadError: React.PropTypes.func,
    onLoaded: React.PropTypes.func,
    onLoading: React.PropTypes.func,
    onSave: React.PropTypes.func,
    tabSize: React.PropTypes.number,
    theme: React.PropTypes.string
  },
  statics: {
    /**
     * @methodOf AcePane
     * @static
     */
    resizeAll: function () {
      _.each(document.querySelectorAll('.ace-pane'), function (el) {
        ace.edit(el).resize();
      });
    },
    /**
     * @param {Element} el
     * @methodOf AcePane
     * @static
     */
    focusByElement: function (el) {
      ace.edit(el).focus();
    }
  },
  getDefaultProps: function () {
    return {
      disabled: false,
      fontSize: 12,
      highlightLine: true,
      keyBindings: 'default',
      theme: 'chrome',
      mode: 'python',
      readOnly: false,
      onLoading: _.noop,
      onLoaded: _.noop,
      onLoadError: _.noop,
      onSave: _.noop,
      tabSize: 4
    };
  },
  componentDidMount: function () {
    const props = this.props,
      instance = ace.edit(ReactDOM.findDOMNode(this));
    let session, langTools, Autocomplete;

    Autocomplete = ace.require('ace/autocomplete').Autocomplete;
    instance.completer = new Autocomplete(instance);

    langTools = ace.require('ace/ext/language_tools');
    /*
     These are available, you know.

     exports.textCompleter = textCompleter;
     exports.keyWordCompleter = keyWordCompleter;
     exports.snippetCompleter = snippetCompleter;
     */
    langTools.setCompleters([]);
    langTools.addCompleter(pythonCompleter);

    instance.setKeyboardHandler(props.keyBindings === 'default' ? null : props.keyBindings);
    instance.setTheme('ace/theme/' + props.theme);
    instance.setFontSize(props.fontSize);
    instance.setHighlightActiveLine(props.highlightLine);
    instance.setReadOnly(props.readOnly);
    session = instance.getSession();
    session.setTabSize(props.tabSize);
    session.setMode('ace/mode/' + props.mode);
    instance.setOptions({
      useSoftTabs: true,
      showPrintMargin: false,
      enableBasicAutocompletion: true,
      enableSnippets: false,
      enableLiveAutocompletion: true
    });
    instance.$blockScrolling = Infinity;
    instance.textInput.getElement().disabled = props.disabled;

    // indent selection
    instance.commands.addCommand({
      name: 'indentSelection',
      bindKey: {win: 'ctrl-\]', mac: 'Command-\]'},
      exec: function (editor) {
        if (editor.getSelectedText()) {
          editor.blockIndent(editor.getSelectionRange());
        } else {
          editor.blockIndent(editor.getCursorPosition().row);
        }
      }
    });

    // outdent selection
    instance.commands.addCommand({
      name: 'outSelection',
      bindKey: {win: 'ctrl-\[', mac: 'Command-\['},
      exec: function (editor) {
        if (editor.getSelectedText()) {
          editor.blockOutdent(editor.getSelectionRange());
        } else {
          editor.blockOutdent(editor.getCursorPosition().row);
        }
      }
    });

    instance.commands.addCommand({
      name: 'saveFile',
      bindKey: {win: 'ctrl-s', mac: 'Command-s'},
      exec: editor => props.onSave(editor)
    });

    instance.commands.addCommand({
      name: 'autocomplete',
      bindKey: {win: 'Tab', mac: 'Tab'},
      exec: function (editor) {
        const pos = editor.getCursorPosition(),
          text = editor.session.getTextRange({
            start: {
              row: pos.row,
              column: pos.column - 1
            },
            end: {
              row: pos.row,
              column: pos.column
            }
          }),
          line = editor.session.getLine(editor.getCursorPosition().row);

        if (/from /.test(line) || /import /.test(line) || (text != ' ' && text != '')) {
          Autocomplete.startCommand.exec(editor);
        } else {
          editor.insert('  ');
        }
      }
    });

    _.defer(() => instance.resize());

    // if filename, load filename into instance
    if (props.filename) {
      props.onLoading();
      send('getFile', props.filename).then(function (content) {
        props.onLoaded();
        session.setValue(content);
      }).catch(function (error) {
        props.onLoadError(error);
      });
    }
  },
  componentDidUpdate: function (oldProps) {
    const props = this.props,
      instance = ace.edit(ReactDOM.findDOMNode(this));

    // if font size has changed
    if (props.fontSize !== oldProps.fontSize) {
      instance.setFontSize(props.fontSize);
    }

    if (props.tabSize !== oldProps.tabSize) {
      instance.getSession().setTabSize(props.tabSize);
    }

    if (props.highlightLine !== oldProps.highlightLine) {
      instance.setHighlightActiveLine(props.highlightLine);
    }

    if (props.readOnly !== oldProps.readOnly) {
      instance.setReadOnly(props.disabled || props.readOnly);
    }

    if (props.disabled !== oldProps.disabled) {
      instance.textInput.getElement().disabled = props.disabled;
    }
  },
  focus: function () {
    const instance = ace.edit(ReactDOM.findDOMNode(this));

    _.defer(function () {
      instance.focus();
    });
  },
  render: function () {
    return (
      <div className="ace-pane" id={this.props.id}></div>
    );
  }
});

