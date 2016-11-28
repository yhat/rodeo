import _ from 'lodash';
import path from 'path';
import knownFileTypes from './known-file-types.yml';

function apply(item, knownFileType) {
  if (knownFileType) {
    item.content.mode = knownFileType.mode || 'python';
    item.featuredActions = knownFileType.featuredActions || [];
    item.icon = knownFileType.icon || 'file-code-o';
    item.syntaxHighlighters = knownFileType.syntaxHighlighters || [];
  } else {
    item.content.mode = 'plain_text';
    item.featuredActions = [];
    item.icon = 'file-o';
    item.syntaxHighlighters = [];
  }

  return item;
}

/**
 * @param {object} item
 * @param {string} mode
 * @returns {object}
 */
function applyByMode(item, mode) {
  mode = mode || 'python';
  const knownFileType = _.find(knownFileTypes, knownFileType => knownFileType.mode === mode);

  return apply(item, knownFileType);
}

/**
 * @param {object} item
 * @param {string} filename
 * @returns {object}
 */
function applyByFilename(item, filename) {
  filename = filename || '';
  const parts = path.parse(filename || ''),
    ext = parts.ext || '',
    knownFileType = _.find(knownFileTypes, knownFileType => _.includes(knownFileType.ext, ext));

  return apply(item, knownFileType);
}

export default {
  applyByFilename,
  applyByMode
};
