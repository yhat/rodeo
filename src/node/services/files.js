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
  const read = bluebird.promisify(fs.readdir);

  dirPath = resolveHomeDirectory(dirPath);

  return read(dirPath).map(function (filename) {
    const fullPath = path.join(dirPath, filename);

    return getStats(fullPath).then(function (fileStats) {
      fileStats.path = fullPath;
      fileStats.filename = filename;

      return fileStats;
    }).catch(function (statEx) {
      log('warn', 'getStats failed', filename, statEx);
      return undefined;
    });
  }).then(list => _.compact(list));
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

/**
 * @param {string} str
 * @returns {string}
 */
function resolveHomeDirectory(str) {
  if (_.startsWith(str, '~') || _.startsWith(str, '%HOME%')) {
    const home = require('os').homedir();

    str = str.replace(/^~/, home).replace(/^%HOME%/, home);
  }

  return str;
}

function getStats(filename) {
  filename = resolveHomeDirectory(filename);
  const lstat = bluebird.promisify(fs.lstat);

  return lstat(filename).then(function (fileStats) {
    fileStats.isSymbolicLink = fileStats.isSymbolicLink();

    return fileStats;
  }).catch(function (lstatEx) {
    log('warn', 'lstat failed', filename, lstatEx);
    const stat = bluebird.promisify(fs.stat);

    return stat(filename).then(function (fileStats) {
      fileStats.isSymbolicLink = false; // let's just assume, kay?

      return fileStats;
    });
  }).then(function (fileStats) {
    fileStats.isFile = fileStats.isFile();
    fileStats.isDirectory = fileStats.isDirectory();

    return fileStats;
  });
}

module.exports.getJSONFileSafeSync = getJSONFileSafeSync;
module.exports.readFile = _.partialRight(bluebird.promisify(fs.readFile), 'utf8');
module.exports.writeFile = bluebird.promisify(fs.writeFile);
module.exports.readDirectory = readDirectory;
module.exports.makeDirectory = bluebird.promisify(fs.mkdir);
module.exports.getStats = getStats;
module.exports.exists = bluebird.promisify(fs.exists);
module.exports.unlink = bluebird.promisify(fs.unlink);
module.exports.saveToTemporaryFile = saveToTemporaryFile;
module.exports.resolveHomeDirectory = resolveHomeDirectory;
