import _ from 'lodash';
import ace from 'ace';
const Autocomplete = ace.require('ace/autocomplete').Autocomplete;

/**
 * Likely, this doesn't belong here.
 *
 * Determine if code is "complete" and therefore should be run
 * @param {*} editor
 * @returns {boolean}
 */
function isCodeComplete(editor) {
  const currentRow = editor.getSelectionRange().end.row,
    session = editor.session,
    totalRows = session.getLength(),
    nextRow = currentRow + 1,
    currentRowContent = session.getLine(currentRow),
    nextRowContent = session.getLine(nextRow);

  return !!(
    (nextRow === totalRows) ||
    (session.getLine(nextRow) === '') ||
    (/return/.test(currentRowContent)) ||
    (!/^ /.test(nextRowContent))
  );
}

/**
 * Go to the next line, even if we have to make a new line to do it
 * @param {*} editor
 */
function forceGoToNextLine(editor) {
  const currentRow = editor.getSelectionRange().end.row,
    nextRow = currentRow + 1,
    session = editor.session;

  if (nextRow === session.getLength()) {
    session.setValue(session.getValue() + '\n');
  }
  editor.gotoLine(currentRow + 2, 10, true);
}

/**
 * Passes on selected text, or the current line
 * Cursor moves to the next line
 * @param {object} instance
 * @param {function} callback
 */
function liftSelection(instance, callback) {
  instance.commands.addCommand({
    name: 'liftSelection',
    bindKey: {win: 'ctrl-Enter', mac: 'Command-Enter'},
    exec: function (editor) {
      let text = editor.getCopyText();

      // if nothing is selected, run the current line
      if (!text || !text.length) {
        const currentRow = editor.getSelectionRange().end.row;

        text = editor.session.getLine(currentRow);
      }

      callback(null, {
        text,
        isCodeComplete: isCodeComplete(editor)
      });

      // go to next line (even if we have to make a new line)
      forceGoToNextLine(editor);
    }
  });
}

function liftFile(instance, fn) {
  instance.commands.addCommand({
    name: 'executeFile',
    bindKey: {win: 'shift-ctrl-Enter', mac: 'Shift-Command-Enter'},
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

function openPreferences(instance, fn) {
  instance.commands.addCommand({
    name: 'saveFile',
    bindKey: {win: 'ctrl-,', mac: 'Command-,'},
    exec: editor => fn(editor)
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
  liftFile,
  liftSelection,
  indent,
  openPreferences,
  outdent,
  saveFile
};
