'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  fs = require('fs'),
  log = require('./log').asInternal(__filename);

/**
 * @param {string} filePath
 * @returns {object}
 */
function getJSONFileSafeSync(filePath) {
  let contents,
    result = null;

  try {
    contents = fs.readFileSync(filePath, {encoding: 'UTF8'});

    try {
      result = JSON.parse(contents);
    } catch (e) {
      log('warn', filePath, 'is not valid JSON', e);
    }
  } catch (ex) {
    // deliberately no warning, thus "safe".
  }

  return result;
}

function readFile(filename) {
  const read = _.partialRight(bluebird.promisify(fs.readFile), 'utf8');

  return read(filename);
}

module.exports.getJSONFileSafeSync = getJSONFileSafeSync;
module.exports.readFile = readFile;