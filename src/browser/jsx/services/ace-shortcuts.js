import _ from 'lodash';
import ace from 'ace';

function getIndentLevel(session, content) {
  content = _.trimEnd(content); // line of all spaces doesn't count
  const tabSize = session.getTabSize();
  let match = content.match(/(^[ \t]*)/),
    indent = match && match[1] || '';

  // replace tabs with spaces
  indent = indent.replace('\t', _.repeat(' ', tabSize));

  return indent.length;
}

/**
 * Likely, this doesn't belong here.
 *
 * Determine if code is "complete" and therefore should be run
 * @param {*} editor
 * @returns {boolean}
 */
function isCodeRunnable(editor) {
  const currentRow = editor.getSelectionRange().end.row,
    session = editor.session,
    totalRows = session.getLength();

  let nextRow = currentRow + 1,
    nextRowContent = session.getLine(nextRow),
    nextIndent = nextRowContent && getIndentLevel(session, nextRowContent);

  // skip rows without content
  while (nextRow < totalRows && nextRowContent.trim() === '') {
    nextRow = nextRow + 1;
    nextRowContent = session.getLine(nextRow);
    nextIndent = nextRowContent && getIndentLevel(session, nextRowContent);
  }

  return !!(
    (nextRow === totalRows) || // end of file
    (nextRow < totalRows && nextIndent === 0) // no indent for next line of content
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
      let text = editor.getSelectedText();

      // if nothing is selected, run the current line
      if (!text || !text.length) {
        const currentRow = editor.getSelectionRange().end.row;

        text = editor.session.getLine(currentRow);
      }

      // if there is actually content to run
      if (_.trim(text) !== '') {
        callback(null, {
          text,
          isCodeRunnable: isCodeRunnable(editor)
        });
      }

      // go to next line (even if we have to make a new line)
      forceGoToNextLine(editor);
    }
  });
}

function liftFile(instance, fn) {
  instance.commands.addCommand({
    name: 'liftFile',
    bindKey: {win: 'shift-ctrl-Enter', mac: 'Shift-Command-Enter'},
    exec: editor => fn(editor)
  });
}

function autocomplete(instance) {
  instance.commands.addCommand({
    name: 'autocomplete',
    bindKey: {win: 'Tab', mac: 'Tab'},
    exec: function (editor) {
      const pos = editor.getCursorPosition(),
        session = editor.getSession(),
        text = editor.session.getTextRange({
          start: {row: pos.row, column: pos.column - 1},
          end: {row: pos.row, column: pos.column}
        }),
        selectedText = editor.getSelectedText(),
        line = editor.session.getLine(editor.getCursorPosition().row);

      if (selectedText) {
        editor.blockIndent(editor.getSelectionRange());
      } else if (/from /.test(line) || /import /.test(line) || (text != ' ' && text != '')) {
        const Autocomplete = ace.require('ace/autocomplete').Autocomplete;

        Autocomplete.startCommand.exec(editor);
      } else {
        editor.insert(session.getUseSoftTabs() ? _.repeat(' ', session.getTabSize()) : '\t');
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
    bindKey: {win: 'ctrl-\[|Shift-Tab', mac: 'Command-\[|Shift-Tab'},
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

function interrupt(instance, fn) {
  instance.commands.addCommand({
    name: 'interrupt',
    bindKey: {win: 'ctrl-shift-c', mac: 'ctrl-c'},
    exec: editor => fn(editor)
  });
}

export default {
  autocomplete,
  indent,
  interrupt,
  liftFile,
  liftSelection,
  openPreferences,
  outdent,
  saveFile
};
