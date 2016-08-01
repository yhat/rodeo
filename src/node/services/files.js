'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  fs = require('fs'),
  path = require('path'),
  log = require('./log').asInternal(__filename),
  temp = require('temp');

temp.track();

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

/**
 * @param {string} dirPath
 * @returns {Promise<[{path: string, filename: string, isDirectory: boolean}]>}
 */
function readDirectory(dirPath) {
  const read = bluebird.promisify(fs.readdir),
    lstat = bluebird.promisify(fs.lstat);

  return read(dirPath).map(function (filename) {
    const fullPath = path.join(dirPath, filename);

    return lstat(fullPath).then(function (fileStats) {
      return {
        path: fullPath,
        filename: filename,
        isDirectory: fileStats.isDirectory()
      };
    });
  });
}

/**
 * @param {string} suffix
 * @param {string|Buffer} data
 * @returns {Promise<string>}
 */
function saveToTemporaryFile(suffix, data) {
  return new bluebird(function (resolve) {
    const stream = temp.createWriteStream({suffix});

    stream.write(data);
    stream.end();

    resolve(stream.path);
  }).timeout(10000, 'Timed out trying to save temporary file with extension', suffix);
}

module.exports.getJSONFileSafeSync = getJSONFileSafeSync;
module.exports.readFile = _.partialRight(bluebird.promisify(fs.readFile), 'utf8');
module.exports.writeFile = bluebird.promisify(fs.writeFile);
module.exports.readDirectory = readDirectory;
module.exports.getStats = bluebird.promisify(fs.lstat);
module.exports.exists = bluebird.promisify(fs.exists);
module.exports.unlink = bluebird.promisify(fs.unlink);
module.exports.saveToTemporaryFile = saveToTemporaryFile;
