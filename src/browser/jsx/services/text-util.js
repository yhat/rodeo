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

function hash() {
  let hash = 0, i, chr, len;

  if (this.length === 0) {
    return hash;
  }

  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return hash;
}

function getRandomCharacters(size) {
  let str = '';

  while (str.length < size) {
    let sub = Math.floor((Math.random() * (Number.MAX_SAFE_INTEGER / 36 * 10))).toString(36);

    str += sub.substr(1); // remove the first character, which is less random than the others
  }

  // cut down to the exact size
  return str.substr(Math.max(str.length - size, 0));
}

export default {
  getCursorPosFromRowColumn,
  spliceString,
  longestLength,
  padRight,
  hash,
  getRandomCharacters
};
