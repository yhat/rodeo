import _ from 'lodash';
import AsciiToHtml from 'ansi-to-html';

const asciiToHtmlConverter = new AsciiToHtml({escapeXML: true});

/**
 * @param {string} str
 * @param {number} row
 * @param {number} column
 * @returns {number}
 */
function getCursorPosFromRowColumn(str, row, column) {
  return str.split('\n', row).reduce((total, line) => total + line.length + 1, 0) + column;
}

function getRowColumnFromCursorPos(str, cursorPos) {
  let row = 0, column = 0,
    max = Math.min(cursorPos, str.length);

  for (let i = 0; i < max; i++) {
    const char = str[i];

    if (char === '\n') {
      row++;
      column = 0;
    } else {
      column++;
    }
  }

  return {row, column};
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
  return strArray.reduce((longest, str) => Math.max(str.toString().length, longest), 0);
}

function padRight(str, length) {
  return str + _.repeat(' ', length - str.toString().length);
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

/**
 * Used when you want to stream
 *
 * This is useful when you want the ascii colors to be continuous over several blocks of text
 *
 * @returns {Filter}
 * @example const converter = getAsciiToHtmlStream(); c = [converter.toHTML(a), converter.toHTML(b)];
 */
function getAsciiToHtmlStream() {
  return new AsciiToHtml({stream: true, escapeXML: true});
}

/**
 * Just converts a single bit of ascii text to html, no state stored between calls.
 * @param {string} str
 * @returns {string}
 */
function fromAsciiToHtml(str) {
  return asciiToHtmlConverter.toHtml(str);
}

export default {
  getCursorPosFromRowColumn,
  getRowColumnFromCursorPos,
  spliceString,
  longestLength,
  padRight,
  hash,
  getRandomCharacters,
  getAsciiToHtmlStream,
  fromAsciiToHtml
};
