import _ from 'lodash';
import ace from 'ace';
const Autocomplete = ace.require('ace/autocomplete').Autocomplete;

function sendCommand(instance, fn) {
  instance.commands.addCommand({
    name: 'sendCommand',
    bindKey: {win: 'ctrl-Enter', mac: 'Command-Enter'},
    exec: editor => fn(editor)
  });
}

function autocomplete(instance, tabSize) {
  instance.commands.addCommand({
    name: 'autocomplete',
    bindKey: {win: 'Tab', mac: 'Tab'},
    exec: function (editor) {
      const pos = editor.getCursorPosition(),
        text = editor.session.getTextRange({
          start: {row: pos.row, column: pos.column - 1},
          end: {row: pos.row, column: pos.column}
        }),
        line = editor.session.getLine(editor.getCursorPosition().row);

      if (/from /.test(line) || /import /.test(line) || (text != ' ' && text != '')) {
        Autocomplete.startCommand.exec(editor);
      } else {
        editor.insert(_.repeat(' ', tabSize));
      }
    }
  });
}

function saveFile(instance, fn) {
  instance.commands.addCommand({
    name: 'saveFile',
    bindKey: {win: 'ctrl-s', mac: 'Command-s'},
    exec: editor => fn(editor)
  });
}

function outdent(instance) {
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
}

function indent(instance) {
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
}

export default {
  autocomplete,
  indent,
  outdent,
  saveFile,
  sendCommand
};
