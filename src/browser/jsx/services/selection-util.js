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
  window.getSelection().removeAllRanges();
  range.selectNode(el);
  window.getSelection().addRange(range);
  document.execCommand('copy');
  _.defer(() => {
    window.getSelection().removeAllRanges();
    for (let i = 0; i < prevSelection.length; i++) {
      window.getSelection().addRange(prevSelection[i]);
    }
  });
}

export default {
  copy,
  isSelectionClick
};
