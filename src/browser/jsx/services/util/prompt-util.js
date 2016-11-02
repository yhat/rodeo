import _ from 'lodash';
import selectionUtil from '../selection-util';

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
 * @param {Event} event
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
    lineElements.push({length, selected, selectedCompletely, selectedText, start, text});
  }

  return lineElements;
}

/**
 * @param {Array} selection
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
function removeSelection(state, selection) {
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
 * @param {MouseEvent} event
 * @returns {{row: number, column: number}}
 */
function getCursorOfClick(event) {
  const selection = window.getSelection(),
    target = event.currentTarget || event.target,
    treeWalker = getLineTreeWalker(target);
  let row = 0;

  if (selectionUtil.isSelectionClick(selection)) {
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

function getSelectionLength(event) {
  const selection = getSelection(event);

  return _.isArray(selection) && _.reduce(selection, (sum, line) => sum + line.length, 0) || 0;
}

export default {
  getLineTreeWalker,
  getCursorOfClick,
  getSelection,
  getSelectionLength,
  getSelectedText,
  removeSelection
};
