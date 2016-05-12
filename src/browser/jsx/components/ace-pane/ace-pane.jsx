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
    content: React.PropTypes.string,
    filename: React.PropTypes.string,
    fontSize: React.PropTypes.number,
    id: React.PropTypes.string,
    keyBindings: React.PropTypes.string,
    mode: React.PropTypes.string,
    onLoadError: React.PropTypes.func,
    onLoaded: React.PropTypes.func,
    onLoading: React.PropTypes.func,
    onSave: React.PropTypes.func,
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
      fontSize: 12,
      keyBindings: 'default',
      theme: 'chrome',
      mode: 'python',
      onLoading: _.noop,
      onLoaded: _.noop,
      onLoadError: _.noop,
      onSave: _.noop
    };
  },
  componentDidMount: function () {
    const props = this.props,
      instance = ace.edit(ReactDOM.findDOMNode(this)),
      keyBindings = props.keyBindings,
      theme = props.theme,
      fontSize = props.fontSize,
      mode = props.mode,
      filename = props.filename;
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


    instance.setKeyboardHandler(keyBindings === 'default' ? null : keyBindings);
    instance.setTheme('ace/theme/' + theme);
    instance.setFontSize(fontSize);
    session = instance.getSession();
    session.setMode('ace/mode/' + mode);
    instance.setOptions({
      useSoftTabs: true,
      showPrintMargin: false,
      enableBasicAutocompletion: true,
      enableSnippets: false,
      enableLiveAutocompletion: true
    });
    instance.$blockScrolling = Infinity;

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
    if (filename) {
      props.onLoading();
      send('get_file', filename).then(function (content) {
        props.onLoaded();
        session.setValue(content);
      }).catch(function (error) {
        props.onLoadError(error);
      });
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

