import _ from 'lodash';
import promptUtils from './util/prompt-util';

function breakLine(state) {
  const lines = state.lines,
    cursor = state.cursor,
    beforeCursor = lines[cursor.row].slice(0, cursor.column),
    afterCursor = lines[cursor.row].slice(cursor.column);
  let newLines = [beforeCursor, afterCursor];

  if (cursor.row > 0) {
    newLines = lines.slice(0, cursor.row).concat(newLines);
  }

  if (cursor.row < lines.length - 1) {
    newLines = newLines.concat(lines.slice(cursor.row + 1));
  }

  return _.assign({}, state, {
    lines: newLines,
    cursor: {row: cursor.row + 1, column: 0}
  });
}

function clear(state) {
  return _.assign({}, state, {
    lines: [''],
    cursor: {row: 0, column: 0}
  });
}

function execute(state) {
  state = _.clone(state);
  const history = state.history || [];

  history.unshift({lines: state.lines});

  return _.assign({}, state, {
    lines: [''],
    cursor: {row: 0, column: 0},
    history,
    historyIndex: -1 // we're not history anymore
  });
}

function insertKey(state, event) {
  const lines = _.clone(state.lines),
    row = state.cursor.row,
    column = state.cursor.column,
    line = lines[row];

  lines[row] = line.slice(0, column) + event.key + line.slice(column);

  return _.assign({}, state, {
    lines,
    cursor: {row, column: column + 1}
  });
}

function moveLeft(state) {
  let lines = state.lines,
    row = state.cursor.row,
    column = state.cursor.column;

  if (column === 0) {
    if (row !== 0) {
      state = _.assign({}, state, {cursor: {row: row - 1, column: lines[row - 1].length}});
    }
  } else {
    state = _.assign({}, state, {cursor: {row, column: column - 1}});
  }

  return state;
}

function moveRight(state) {
  let lines = state.lines,
    row = state.cursor.row,
    column = state.cursor.column;

  if (column === lines[row].length) {
    if (row < lines.length - 1) {
      state = _.assign({}, state, {cursor: {row: row + 1, column: 0}});
    }
  } else {
    state = _.assign({}, state, {cursor: {row, column: column + 1}});
  }

  return state;
}

function moveUp(state) {
  let lines = state.lines,
    row = state.cursor.row,
    column = state.cursor.column;

  if (row !== 0) {
    state = _.assign({}, state, {cursor: {row: row - 1, column: Math.min(column, lines[row - 1].length)}});
  } else {
    state = showPrevious(state);
  }

  return state;
}

function moveDown(state) {
  let lines = state.lines,
    row = state.cursor.row,
    column = state.cursor.column;

  if (row !== lines.length - 1) {
    state = _.assign({}, state, {cursor: {row: row + 1, column: Math.min(column, lines[row + 1].length)}});
  } else {
    state = showNext(state);
  }

  return state;
}

/**
 * Backspace has different behavior depending on the position of the cursor
 *
 * @param {object} state
 * @returns {object}
 */
function backspace(state) {
  const row = state.cursor.row,
    column = state.cursor.column;

  if (column > 0) {
    state = promptUtils.removePreviousCharacter(state);
  } else if (column === 0 && row > 0) {
    state = promptUtils.mergeLineWithPrevious(state);
  }

  return state;
}

/**
 * Delete is a keyword in JavaScript, so cannot be the name of a function.
 *
 * Delete is also becoming rare on keyboard.
 */
function deleteSpecial(state) {
  const row = state.cursor.row,
    column = state.cursor.column;

  if (column > 0) {
    state = promptUtils.removeNextCharacter(state);
  } else if (column === 0 && row > 0) {
    state = promptUtils.mergeLineWithNext(state);
  }

  return state;
}

function showPrevious(state) {
  if (state.history && state.history.length) {
    let historyIndex,
      history = state.history;

    if (_.isNumber(state.historyIndex) && state.historyIndex > 0) {
      historyIndex = state.historyIndex + 1;
    } else {
      history.unshift({lines: state.lines});
      historyIndex = 1;
    }

    if (state.history[historyIndex]) {
      const lines = state.history[historyIndex].lines,
        lastRow = lines.length - 1,
        lastRowLastColumn = lines[lastRow].length;

      state = _.assign({}, state, {
        lines,
        cursor: {
          row: lastRow,
          column: lastRowLastColumn
        },
        history,
        historyIndex
      });
    }
  }

  return state;
}

function showNext(state) {
  if (state.history && _.isNumber(state.historyIndex) && state.historyIndex > 0) {
    const history = state.history,
      historyIndex = state.historyIndex - 1;

    if (state.history[historyIndex]) {
      const lines = state.history[historyIndex].lines,
        cursor = {
          row: 0,
          column: 0
        };

      if (historyIndex === 0) {
        state = _.clone(state);
        state.historyIndex = -1; // not history
        state.lines = state.history[0].lines;
        state.history.shift();
        state.cursor = cursor;
      } else {
        state = _.assign({}, state, {
          lines,
          cursor,
          history,
          historyIndex
        });
      }
    }
  }

  return state;
}

function paste(state, event) {
  // override the default system event handling, because we can do better
  event.preventDefault();
  const text = event.clipboardData.getData('text');

  if (text) {
    const textSplit = text.split('\n');

    if (textSplit.length === 1) {
      state = promptUtils.insertText(state, text);
    } else {
      state = promptUtils.insertMultiLineText(state, text);
    }
  }

  window.getSelection().collapseToStart();

  return state;
}

function copy(state, event) {
  // override the default system event handling, because we can do better
  event.preventDefault();

  const selectedText = promptUtils.getSelectedText(promptUtils.getSelection(event));

  event.clipboardData.setData('text', selectedText);

  return state;
}

function cut(state, event) {
  // override the default system event handling, because we can do better
  event.preventDefault();

  const selection = promptUtils.getSelection(event),
    selectedText = promptUtils.getSelectedText(selection);

  state = promptUtils.removeSelectionFromState(state,  selection);

  window.getSelection().collapseToStart();

  event.clipboardData.setData('text', selectedText);
  event.clipboardData.setData('text/plain', selectedText);

  return state;
}

function removePreviousWord(state) {
  let lines = state.lines,
    line = state.lines[state.cursor.row],
    row = state.cursor.row,
    column = promptUtils.getPreviousWordIndex(line, state.cursor.column);

  if (column !== -1 && column < state.cursor.column) {
    lines = _.clone(state.lines);
    lines[row] = line.slice(0, column) + line.slice(state.cursor.column);
  }

  return _.assign({}, state, {lines, cursor: {row, column}});
}

function removeNextWord(state) {
  let lines = state.lines,
    line = state.lines[state.cursor.row],
    row = state.cursor.row,
    column = promptUtils.getNextWordIndex(line, state.cursor.column);

  if (column !== -1 && column > state.cursor.column) {
    lines = _.clone(state.lines);
    lines[row] = line.slice(0, state.cursor.column) + line.slice(column);
  }

  return _.assign({}, state, {lines, cursor: {row, column: state.cursor.column}});
}

function moveToPrecedingWord(state) {
  const line = state.lines[state.cursor.row];
  let row = state.cursor.row,
    column = promptUtils.getPreviousWordIndex(line, state.cursor.column);

  if (column === -1) {
    if (row > 0) {
      row -= 1;
      column = state.lines[row].length;
    } else {
      column = 0;
    }
  }

  return _.assign({}, state, {cursor: {row, column}});
}

function moveToFollowingWord(state) {
  const line = state.lines[state.cursor.row];
  let row = state.cursor.row,
    column = promptUtils.getNextWordIndex(line, state.cursor.column);

  if (column === -1) {
    if (row < state.lines.length - 1) {
      row += 1;
      column = 0;
    } else {
      column = line.length;
    }
  }

  return _.assign({}, state, {cursor: {row, column}});
}

function moveToBeginningLine(state) {
  const row = state.cursor.row;

  return _.assign({}, state, {cursor: {row, column: 0}});
}

function moveToEndLine(state) {
  const row = state.cursor.row,
    lastColumn = state.lines[row].length;

  return _.assign({}, state, {cursor: {row, column: lastColumn}});
}

function moveToBeginningFirstLine(state) {
  return _.assign({}, state, {cursor: {row: 0, column: 0}});
}

function moveToEndLastLine(state) {
  const lines = state.lines,
    lastRow = lines.length - 1,
    lastColumn = lines[lastRow].length;

  return _.assign({}, state, {cursor: {row: lastRow, column: lastColumn}});
}

function moveToClick(state, event) {
  const cursor = promptUtils.getCursorOfClick(event);

  if (cursor) {
    state = _.assign({}, state, {cursor});
  }

  return state;
}

export default {
  backspace,
  breakLine,
  clear,
  copy,
  cut,
  deleteSpecial,
  execute,
  insertKey,
  moveToBeginningFirstLine,
  moveToBeginningLine,
  moveDown,
  moveToEndLastLine,
  moveToEndLine,
  moveToClick,
  moveLeft,
  moveRight,
  moveToFollowingWord,
  moveToPrecedingWord,
  moveUp,
  removeNextWord,
  removePreviousWord,
  paste,
  showPrevious,
  showNext
};
