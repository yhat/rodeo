import _ from 'lodash';

/**
 * @param {Selection} selection
 * @returns {boolean}
 * @example
 * function onClick(event) {
 *   const isClick = isSelectionClick(window.getSelection());
 * }
 */
function isSelectionClick(selection) {
  return selection.anchorOffset === selection.focusOffset && selection.anchorNode === selection.focusNode;
}

function copy(el) {
  const range = document.createRange(),
    prevSelection = [],
    selection = window.getSelection();

  for (let i = 0; i < selection.rangeCount; i++) {
    prevSelection[i] = selection.getRangeAt(i);
  }
  selection.removeAllRanges();
  range.selectNode(el);
  selection.addRange(range);
  document.execCommand('copy');
  _.defer(() => {
    window.getSelection().removeAllRanges();
    for (let i = 0; i < prevSelection.length; i++) {
      window.getSelection().addRange(prevSelection[i]);
    }
  });
}

function selectElement(el) {
  const range = document.createRange(),
    selection = window.getSelection();

  selection.removeAllRanges();
  range.selectNode(el);
  selection.addRange(range);
}

export default {
  copy,
  isSelectionClick,
  selectElement
};
