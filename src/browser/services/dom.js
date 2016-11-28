/**
 * Helper functions for tranversing the dom without jQuery
 * @module
 */

/**
 * @param {Node} node
 * @param {string} nodeName
 * @returns {Element|Node|false}
 */
export function getParentNodeOf(node, nodeName) {
  nodeName = nodeName.toUpperCase();
  while (node.parentNode && node.nodeName !== nodeName) {
    node = node.parentNode;
  }
  return node.nodeName === nodeName && node;
}

