/**
 * These functions map up to functions referenced in ./editor-commands.yml
 *
 * @module
 */

import _ from 'lodash';
import commonTabsActions from '../../services/common-tabs-actions';
import applicationControl from '../../services/application-control';
import freeTabActions from '../free-tab-group/free-tab-group.actions';
import documentTerminalViewerActions from '../document-terminal-viewer/document-terminal-viewer.actions';
import blockTerminalViewerActions from '../block-terminal-viewer/block-terminal-viewer.actions';
import dialogActions from '../../actions/dialogs';

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

function getSelectionOrLine(editor) {
  let text = editor.getCopyText();

  // if nothing is selected, run the current line
  if (!text || !text.length) {
    const currentRow = editor.getSelectionRange().end.row;

    text = editor.session.getLine(currentRow);
  }

  return text;
}

function interrupt() {
  return freeTabActions.interrupt();
}

function openPreferences() {
  return dialogActions.showPreferences();
}

function executeSelection(props, id, command, editor) {
  const text = getSelectionOrLine(editor);

  forceGoToNextLine(editor);
  props.onExecute(id, {text});

  return true;
}

function executeFile(props, id, command, editor) {
  const text = editor.getValue();

  props.onExecute(id, {text});

  return true;
}

function isSelection(editor) {
  let text = editor.getCopyText();

  return text && text.length;
}

function isLeftOfCursorBlank(editor) {
  const selectionEnd = editor.getSelectionRange().end;
  let line = editor.session.getLine(selectionEnd.row);

  if (selectionEnd.column === 0) {
    return true;
  }

  line = editor.session.getLine(selectionEnd.row);

  return /[\s\(\)\}\{\[\]}]/.test(line[selectionEnd.column - 1]);
}

function autocomplete(props, tabId, command, editor) {
  if (isSelection(editor) || isLeftOfCursorBlank(editor)) {
    return false;
  }

  return editor.commands.exec('startAutocomplete', editor);
}

export default {
  autocomplete,
  executeFile,
  executeSelection,
  interrupt,
  openPreferences
};
