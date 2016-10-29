import _ from 'lodash';

function removeNextCharacter(state) {
  const lines = _.clone(state.lines),
    row = state.cursor.row,
    column = state.cursor.column,
    line = lines[row];

  lines[row] = line.slice(0, column) + line.slice(column + 1);

  return _.assign({}, state, {lines, cursor: {row, column: column - 1}});
}

function removePreviousCharacter(state) {
  const lines = _.clone(state.lines),
    row = state.cursor.row,
    column = state.cursor.column,
    line = lines[row];

  lines[row] = line.slice(0, column - 1) + line.slice(column);

  return _.assign({}, state, {lines, cursor: {row, column: column - 1}});
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

  return _.assign({}, state, {lines: newLines, cursor: {row: row - 1, column: newLines[row - 1].length}});
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

  return _.assign({}, state, {lines: newLines, cursor: {row: row - 1, column: newLines[row - 1].length}});
}

function insertText(state, text) {
  state = _.clone(state);
  const textSplit = text.split('\n'),
    row = state.cursor.row,
    column = state.cursor.column,
    line = state.lines[row],
    lines = state.lines,
    newLines = _.clone(lines);

  newLines[row] = line.slice(0, column) + textSplit[0] + line.slice(column);

  return _.assign({}, state, {lines: newLines, cursor: {row, column: column + textSplit[0].length}});
}

function insertMultiLineText(state, text) {
  state = _.clone(state);
  const textSplit = text.split('\n'),
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

  return _.assign({}, state, {lines: newLines, cursor: {row: lastLineRow, column: lastLineColumn}});
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

/**
 * @param {Node} target
 * @returns {TreeWalker}
 */
function getLineTreeWalker(target) {
  return document.createTreeWalker(
    target,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node) {
        if (node.classList && node.classList.contains('prompt-line')) {
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    },
    false
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isTextNode(node) {
  return node.nodeType === 3;
}

/**
 * @param {MouseEvent} event
 * @returns {Array}
 */
function getSelection(event) {
  const selection = window.getSelection(),
    target = event.currentTarget || event.target,
    treeWalker = getLineTreeWalker(target),
    lineElements = [];
  let focusFound = false, anchorFound = false;

  while (treeWalker.nextNode()) {
    const node = treeWalker.currentNode,
      selected = selection.containsNode(node, true),
      selectedCompletely = selection.containsNode(node, false);
    let length, start,
      text = '',
      selectedText = '';

    for (let i = 0; i < node.childNodes.length; i++) {
      let childNode = node.childNodes[i];

      if (isTextNode(childNode)) {
        if (selection.containsNode(childNode, false)) {
          let value = childNode.nodeValue;

          if (selection.anchorNode === childNode && selection.focusNode === childNode) {
            start = Math.min(selection.anchorOffset, selection.focusOffset);
            length = Math.max(selection.anchorOffset, selection.focusOffset) - start;
            value = value.substr(start, length);
          } else if (selection.anchorNode === childNode) {
            anchorFound = true;
            if (start === undefined && !focusFound) {
              start = selection.anchorOffset;
              value = value.substr(start);
            } else {
              length = selectedText.length + selection.anchorOffset;
              value = value.substr(0, length);
            }
          } else if (selection.focusNode === childNode) {
            focusFound = true;
            if (start === undefined && !anchorFound) {
              start = selection.focusOffset;
              value = value.substr(start);
            } else {
              length = selectedText.length + selection.focusOffset;
              value = value.substr(0, length);
            }
          }

          selectedText += value;
        }

        text += childNode.nodeValue;
      }
    }

    start = start || 0;
    length = length || selectedText.length;
    lineElements.push({length, node, selected, selectedCompletely, selectedText, start, text});
  }

  return lineElements;
}

/**
 * @param {Selection} selection
 * @returns {string}
 */
function getSelectedText(selection) {
  return _.reduce(selection, (text, line) => {
    if (line.selectedText) {
      if (text) {
        text += '\n';
      }

      text += line.selectedText;
    }

    return text;
  }, '');
}

/**
 * @param {object} state
 * @param {Selection} selection
 * @returns {object}
 */
function removeSelectionFromState(state, selection) {
  let row, column,
    lines = _.reduce(selection, (lines, lineInfo, index) => {
      if (!lineInfo.selectedCompletely) {
        // forget the line if completely selected
        if (lineInfo.selected) {
          const text = lineInfo.text.slice(0, lineInfo.start) +
            lineInfo.text.slice(lineInfo.start + lineInfo.length);

          if (lineInfo.start === 0 && index > 0) {
            lines[lines.length - 1] += text;
          } else {
            lines.push(text);
          }
        } else {
          lines.push(lineInfo.text);
        }
      }

      return lines;
    }, []);

  if (lines.length === 0) {
    lines = [''];
    column = 0;
    row = 0;
  } else {
    row = _.findIndex(selection, {selected: true});
    column = selection[row].start;

    while (row > 0 && !lines[row]) {
      row -= 1;
      column = selection[row].text.length;
    }
  }

  return _.assign({}, state, {lines, cursor: {row, column}});
}

/**
 * @param {Selection} selection
 */
function isSelectionClick(selection) {
  return selection.anchorOffset === selection.focusOffset && selection.anchorNode === selection.focusNode;
}

/**
 * @param {MouseEvent} event
 * @returns {{row: number, column: number}}
 */
function getCursorOfClick(event) {
  const selection = window.getSelection(),
    target = event.currentTarget || event.target,
    treeWalker = getLineTreeWalker(target);
  let row = 0;

  if (isSelectionClick(selection)) {
    while (treeWalker.nextNode()) {
      const node = treeWalker.currentNode,
        selected = selection.containsNode(node, true);
      let text = '';

      if (selected) {
        for (let i = 0; i < node.childNodes.length; i++) {
          let childNode = node.childNodes[i];

          if (isTextNode(childNode)) {
            let value = childNode.nodeValue;

            if (selection.containsNode(childNode, false)) {
              const column = text.length + selection.anchorOffset;

              return {row, column};
            }

            text += value;
          }
        }
      }

      row++;
    }
  }
}

export default {
  getLineTreeWalker,
  getNextWordIndex,
  getPreviousWordIndex,
  getCursorOfClick,
  getSelection,
  getSelectedText,
  insertMultiLineText,
  insertText,
  mergeLineWithNext,
  mergeLineWithPrevious,
  removeNextCharacter,
  removePreviousCharacter,
  removeSelectionFromState
};
