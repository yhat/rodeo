import _ from 'lodash';

/**
 * @param {string} str
 * @param {number} row
 * @param {number} column
 * @returns {number}
 */
function getCursorPosFromRowColumn(str, row, column) {
  return str.split('\n', row).reduce((total, line) => total + line.length + 1, 0) + column;
}

/**
 *
 * @param {string} str
 * @param {number} index
 * @param {number} count
 * @param {string} add
 * @returns {string}
 * @see http://stackoverflow.com/questions/20817618/is-there-a-splice-method-for-strings
 */
function spliceString(str, index, count, add) {
  return str.slice(0, index) + (add || '') + str.slice(index + count);
}

function longestLength(strArray) {
  return strArray.reduce((longest, str) => Math.max(str.length, longest), 0);
}

function padRight(str, length) {
  return str + _.repeat(' ', length - str.length);
}

export default {
  getCursorPosFromRowColumn,
  spliceString,
  longestLength,
  padRight
};
