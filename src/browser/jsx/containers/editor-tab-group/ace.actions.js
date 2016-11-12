import _ from 'lodash';
import ace from 'ace';
import freeTabActions from '../free-tab-group/free-tab-group.actions';
import dialogActions from '../../actions/dialogs';
import client from '../../services/jupyter/client';
import pythonLanguage from '../../services/jupyter/python-language';

const remembrance = {};

/**
 * Go to the next line, even if we have to make a new line to do it
 * @param {*} editor
 */
function forceGoToNextLine(editor) {
  const currentRow = Math.max(editor.selection.anchor.row, editor.selection.lead.row),
    nextRow = currentRow + 1,
    session = editor.session;

  if (nextRow === session.getLength()) {
    session.setValue(session.getValue() + '\n');
  }

  editor.selection.clearSelection();
  editor.moveCursorTo(nextRow, 0, false);
}

function getSelectionOrLine(editor) {
  let text = editor.getSelectedText();

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
  return !editor.getSelection().isEmpty();
}

function isLeftOfCursorBlank(editor) {
  const selectionEnd = editor.getSelectionRange().end;
  let line, characterBefore;

  if (selectionEnd.column === 0) {
    return true;
  }

  line = editor.session.getLine(selectionEnd.row);
  characterBefore = line[selectionEnd.column - 1];

  return hasWhitespace(characterBefore);
}

function autocomplete(props, tabId, command, editor) {
  if (isSelection(editor) || isLeftOfCursorBlank(editor)) {
    return false;
  }

  return editor.commands.exec('startAutocomplete', editor);
}

function iterateUntilComplete(editor, textList, endRow) {
  return client.isComplete(textList.join('\n')).then(result => {
    const nextLine = editor.session.getLine(endRow + 1),
      status = result.status;

    if (status === 'incomplete') {
      if (endRow < editor.session.getLength()) {
        textList.push(_.trimEnd(nextLine));
        return iterateUntilComplete(editor, textList, endRow + 1);
      } else {
        return {textList, status, endRow};
      }
    } else if (status === 'complete') {
      return {textList, status, endRow};
    } else {
      return {textList, status, endRow};
    }
  });
}

/**
 * @param {string} char
 * @returns {boolean}
 */
function hasWhitespace(char) {
  return char && /\s/.test(char);
}

function collectJupyterBlockSelection(props, id, editor, startRow) {
  return function (result) {
    const obj = _.assign({startRow}, result),
      textList = obj.textList;

    editor.selection.clearSelection();
    ace.require(['ace/range'], function (instance) {
      const AceRange = instance.Range;

      if (obj.startRow === obj.endRow && obj.status === 'complete') {
        props.onExecute(id, {text: textList.join('\n')});
        editor.selection.clearSelection();
        editor.moveCursorTo(obj.endRow + 1, 0, false);
      } else {
        editor.selection.setSelectionRange(new AceRange(obj.startRow, 0, obj.endRow, _.last(obj.textList).length), false);
      }
    });
  };
}

function selectJupyterBlock(props, id, command, editor) {
  const selection = editor.getSelection();
  let now, currentRow, textList, runnableFirst,
    startRow = editor.getSelectionRange().end.row,
    firstLine = editor.session.getLine(startRow);

  if (!selection.isEmpty() || !pythonLanguage.isCodeLine(firstLine)) {
    return false;
  }

  // if there is content on _this_ line, but the first character is whitespace,
  // then search upwards for a line starting with characters that are not a comment
  textList = [firstLine];
  currentRow = startRow;
  runnableFirst = pythonLanguage.isRunnableFirstLine(firstLine);
  if (!runnableFirst) {
    while (startRow > 0 && !runnableFirst) {
      startRow--;
      firstLine = editor.session.getLine(startRow);
      runnableFirst = pythonLanguage.isRunnableFirstLine(firstLine);
      if (pythonLanguage.isCodeLine(firstLine)) {
        textList.unshift(firstLine);
      }
    }

    // if we reached the start of the file and there still is no runnable line, demur
    if (!runnableFirst) {
      return false; // someone else can deal with this situation!
    }
  }

  now = new Date().getTime();
  if (!remembrance['selectJupyterBlock'] || remembrance['selectJupyterBlock'] < now - 3000) {
    remembrance['selectJupyterBlock'] = now;
    iterateUntilComplete(editor, textList, currentRow)
      .then(collectJupyterBlockSelection(props, id, editor, startRow))
      .finally(() => delete remembrance['selectJupyterBlock']);
  }

  return true;
}

export default {
  autocomplete,
  executeFile,
  executeSelection,
  interrupt,
  openPreferences,
  selectJupyterBlock
};
