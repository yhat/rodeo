'use strict';

const fs = require('fs');


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
      console.warn(filePath + ' is not valid JSON: ' + e.message);
    }
  } catch (ex) {
    // deliberately no warning, thus "safe".
  }

  return result;
}

module.exports.getJSONFileSafeSync = getJSONFileSafeSync;