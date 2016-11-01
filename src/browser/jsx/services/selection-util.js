
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

export default {
  isSelectionClick
};
