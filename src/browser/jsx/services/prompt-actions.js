import _ from 'lodash';

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

  return move(state, {
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
  const history = _.clone(state.history || []);

  history.unshift({lines: state.lines});

  return move(state, {
    lines: [''],
    cursor: {row: 0, column: 0},
    history,
    historyIndex: -1 // we're not history anymore
  });
}

/**
 * Text is assumed to be simple; often a single character
 * @param {object} state
 * @param {object} command
 * @param {string} command.key
 * @returns {object}
 */
function insertKey(state, command) {
  const lines = _.clone(state.lines),
    row = state.cursor.row,
    column = state.cursor.column,
    line = lines[row];

  lines[row] = line.slice(0, column) + command.key + line.slice(column);

  return move(state, {
    lines,
    cursor: {row, column: column + 1}
  });
}

/**
 * Force the text to be a single line
 * @param {object} state
 * @param {object} command
 * @param {string} command.text
 * @returns {object}
 */
function insertSingleLineText(state, command) {
  const textSplit = command.text.split('\n'),
    row = state.cursor.row,
    column = state.cursor.column,
    line = state.lines[row],
    lines = state.lines,
    newLines = _.clone(lines);

  newLines[row] = line.slice(0, column) + textSplit[0] + line.slice(column);

  return move(state, {
    lines: newLines,
    cursor: {row, column: column + textSplit[0].length}
  });
}

/**
 * Text is assumed to be multiple lines
 * @param {object} state
 * @param {object} command
 * @param {string} command.text
 * @returns {object}
 */
function insertMultiLineText(state, command) {
  const textSplit = command.text.split('\n'),
    row = state.cursor.row,
    column = state.cursor.column,
    line = state.lines[row],
    lines = state.lines,
    before = line.slice(0, column),
    after = line.slice(column);
  let newLines = textSplit,
    lastLineIndex = newLines.length - 1,
    lastLineRow = textSplit.length - 1,
    lastLineColumn = newLines[lastLineIndex].length;

  newLines[0] = before + newLines[0];
  newLines[lastLineIndex] = newLines[lastLineIndex] + after;

  if (row > 0) {
    lastLineRow += row;
    newLines = lines.slice(0, row).concat(newLines);
  }

  if (row < lines.length - 1) {
    newLines = newLines.concat(lines.slice(row + 1));
  }

  return move(state, {lines: newLines, cursor: {row: lastLineRow, column: lastLineColumn}});
}

/**
 * End of the line counts as the start of a word.
 * Returns -1 if there are no words left
 *
 * @param {string} line
 * @param {number} [start=0]
 * @param {number} [end=line.length]
 * @returns {number}
 */
function getNextWordIndex(line, start, end) {
  start = start || 0;
  end = line.length || end;
  let index = line.substring(start, end).search(/\W/);

  if (index === -1) {
    if (start < end) {
      return end;
    }

    return index;
  } else {
    // the index is relative to the start, so move forward
    index += start;
  }

  do {
    index += 1;
  } while (index < end && /\W/.test(line[index]));

  return index;
}

/**
 * @param {string} line
 * @param {number} [start=0]
 * @returns {number}
 */
function getPreviousWordIndex(line, start) {
  start = start || 0;
  let index = start;

  // if we're already at the start, it's hopeless
  if (index === 0) {
    return -1;
  }

  // if we're already at the beginning of a word, first search for a new word
  if (/\W/.test(line[index - 1])) {
    do {
      index -= 1;
    } while (index > 0 && /\W/.test(line[index]));
  }

  // find first whitespace going backward
  while (index > 0 && /\w/.test(line[index])) {
    index -= 1;
  }

  if (index === 0) {
    // we're at the very beginning
    return index;
  }

  // else we hit whitespace, so move forward by one
  return index + 1;
}

function moveLeft(state) {
  let lines = state.lines,
    row = state.cursor.row,
    column = state.cursor.column;

  if (column === 0) {
    if (row !== 0) {
      state = move(state, {cursor: {row: row - 1, column: lines[row - 1].length}});
    }
  } else {
    state = move(state, {cursor: {row, column: column - 1}});
  }

  return state;
}

function moveRight(state) {
  let lines = state.lines,
    row = state.cursor.row,
    column = state.cursor.column;

  if (column === lines[row].length) {
    if (row < lines.length - 1) {
      state = move(state, {cursor: {row: row + 1, column: 0}});
    }
  } else {
    state = move(state, {cursor: {row, column: column + 1}});
  }

  return state;
}

function moveUp(state) {
  let lines = state.lines,
    row = state.cursor.row,
    column = state.cursor.column;

  if (row !== 0) {
    state = move(state, {cursor: {row: row - 1, column: Math.min(column, lines[row - 1].length)}});
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
    state = move(state, {cursor: {row: row + 1, column: Math.min(column, lines[row + 1].length)}});
  } else {
    state = showNext(state);
  }

  return state;
}

function removeNextCharacter(state) {
  const lines = _.clone(state.lines),
    row = state.cursor.row,
    column = state.cursor.column,
    line = lines[row];

  lines[row] = line.slice(0, column) + line.slice(column + 1);

  return move(state, {lines, cursor: {row, column: column - 1}});
}

function removePreviousCharacter(state) {
  const lines = _.clone(state.lines),
    row = state.cursor.row,
    column = state.cursor.column,
    line = lines[row];

  lines[row] = line.slice(0, column - 1) + line.slice(column);

  return move(state, {lines, cursor: {row, column: column - 1}});
}

function mergeLineWithPrevious(state) {
  const lines = _.clone(state.lines),
    row = state.cursor.row,
    line = lines[row];

  // merge lines
  let newLines = [(lines[row - 1] + line)];

  if (row - 1 > 0) {
    newLines = lines.slice(0, row - 1).concat(newLines);
  }

  if (row < lines.length - 1) {
    newLines = newLines.concat(lines.slice(row + 1));
  }

  return move(state, {lines: newLines, cursor: {row: row - 1, column: newLines[row - 1].length}});
}

function mergeLineWithNext(state) {
  const lines = _.clone(state.lines),
    row = state.cursor.row,
    line = lines[row];

  // merge lines
  let newLines = [(lines[row - 1] + line)];

  if (row - 1 > 0) {
    newLines = lines.slice(0, row - 1).concat(newLines);
  }

  if (row < lines.length - 1) {
    newLines = newLines.concat(lines.slice(row + 1));
  }

  return move(state, {lines: newLines, cursor: {row: row - 1, column: newLines[row - 1].length}});
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
    state = removePreviousCharacter(state);
  } else if (column === 0 && row > 0) {
    state = mergeLineWithPrevious(state);
  }

  return state;
}

/**
 * Delete is a keyword in JavaScript, so cannot be the name of a function.
 *
 * Delete is also becoming rare on keyboard.
 * @param {object} state
 * @returns {object}
 */
function deleteSpecial(state) {
  const row = state.cursor.row,
    column = state.cursor.column;

  if (column > 0) {
    state = removeNextCharacter(state);
  } else if (column === 0 && row > 0) {
    state = mergeLineWithNext(state);
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
      history = _.clone(history);
      history.unshift({lines: state.lines});
      historyIndex = 1;
    }

    if (history[historyIndex]) {
      const lines = history[historyIndex].lines,
        lastRow = lines.length - 1,
        lastRowLastColumn = lines[lastRow].length;

      state = move(state, {
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
      historyIndex = state.historyIndex - 1,
      oldCursor = state.cursor;

    if (history[historyIndex]) {
      const lines = history[historyIndex].lines,
        cursor = {
          row: 0,
          column: Math.min(oldCursor.column, lines[0].length)
        };

      if (historyIndex === 0) {
        state = _.clone(state);
        state.historyIndex = -1; // not history
        state.lines = history[0].lines;
        state.history = _.clone(history);
        state.history.shift();
        state.cursor = cursor;
      } else {
        state = move(state, {
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

function removePreviousWord(state) {
  let lines = state.lines,
    line = state.lines[state.cursor.row],
    row = state.cursor.row,
    column = getPreviousWordIndex(line, state.cursor.column);

  if (column !== -1 && column < state.cursor.column) {
    lines = _.clone(state.lines);
    lines[row] = line.slice(0, column) + line.slice(state.cursor.column);
    state = move(state, {lines, cursor: {row, column}});
  } else if (state.cursor.column === 0 && row > 0) {
    state = mergeLineWithPrevious(state);
  }

  return state;
}

function removeNextWord(state) {
  let lines = state.lines,
    line = state.lines[state.cursor.row],
    row = state.cursor.row,
    column = getNextWordIndex(line, state.cursor.column);

  if (column !== -1 && column > state.cursor.column) {
    lines = _.clone(state.lines);
    lines[row] = line.slice(0, state.cursor.column) + line.slice(column);
  }

  return move(state, {lines, cursor: {row, column: state.cursor.column}});
}

function moveToPrecedingWord(state) {
  const line = state.lines[state.cursor.row];
  let row = state.cursor.row,
    column = getPreviousWordIndex(line, state.cursor.column);

  if (column === -1) {
    if (row > 0) {
      row -= 1;
      column = state.lines[row].length;
    } else {
      column = 0;
    }
  }

  return move(state, {cursor: {row, column}});
}

function moveToFollowingWord(state) {
  const line = state.lines[state.cursor.row];
  let row = state.cursor.row,
    column = getNextWordIndex(line, state.cursor.column);

  if (column === -1) {
    if (row < state.lines.length - 1) {
      row += 1;
      column = 0;
    } else {
      column = line.length;
    }
  }

  return move(state, {cursor: {row, column}});
}

function moveToBeginningLine(state) {
  const row = state.cursor.row;

  return move(state, {cursor: {row, column: 0}});
}

function moveToEndLine(state) {
  const row = state.cursor.row,
    lastColumn = state.lines[row].length;

  return move(state, {cursor: {row, column: lastColumn}});
}

function moveToBeginningFirstLine(state) {
  return move(state, {cursor: {row: 0, column: 0}});
}

function moveToEndLastLine(state) {
  const lines = state.lines,
    lastRow = lines.length - 1,
    lastColumn = lines[lastRow].length;

  return move(state, {cursor: {row: lastRow, column: lastColumn}});
}

function move(state, command) {
  return _.assign({}, state, command);
}

function insertSpecific(state, command) {
  return insertSingleLineText(state, {text: command.specific});
}

export default {
  backspace,
  breakLine,
  clear,
  deleteSpecial,
  execute,
  insertKey,
  insertMultiLineText,
  insertSingleLineText,
  insertSpecific,
  move,
  moveToBeginningFirstLine,
  moveToBeginningLine,
  moveDown,
  moveToEndLastLine,
  moveToEndLine,
  moveLeft,
  moveRight,
  moveToFollowingWord,
  moveToPrecedingWord,
  moveUp,
  removeNextWord,
  removePreviousWord,
  showPrevious,
  showNext
};
