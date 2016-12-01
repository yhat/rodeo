import _ from 'lodash';
import bluebird from 'bluebird';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import temp from 'temp';

const fileWatchers = {},
  log = require('./log').asInternal(__filename);

temp.track();

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
      _.assign(fileStats, path.parse(fullPath));

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

/**
 * Convert /Users/somename/file.txt to ~/file.txt
 * @param {string} str
 * @returns {string}
 */
function getWithHomeDirectoryShortName(str) {
  const home = require('os').homedir();

  if (_.startsWith(str, home)) {
    str = path.join('~', str.substr(home.length));
  }

  return str;
}

function getStats(filename) {
  filename = resolveHomeDirectory(filename);
  const lstat = bluebird.promisify(fs.lstat);

  return lstat(filename)
    .catch(function (lstatEx) {
      log('warn', 'lstat failed', filename, lstatEx);
      const stat = bluebird.promisify(fs.stat);

      return stat(filename);
    })
    .then(normalizeStats);
}

function close(fd) {
  return new bluebird(function (resolve, reject) {
    log('info', 'closing', {fd});
    fs.close(fd, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function open(filename, flags) {
  return new bluebird(function (resolve, reject) {
    log('info', 'opening', {filename, flags});
    fs.open(filename, flags, function (err, fd) {
      log('info', 'opened', {filename, err, fd});
      if (err) {
        reject(err);
      } else {
        resolve(fd);
      }
    });
  }).disposer(function (fd) {
    log('info', 'open disposer', {filename, fd});
    return close(fd);
  });
}

/**
 * @param {string} src
 * @param {string} dest
 * @returns {Promise<undefined>}
 */
function copy(src, dest) {
  log('info', 'copy', {src, dest});

  return bluebird.using(open(src, 'r'), open(dest, 'w'), function (readFd, writeFd) {
    return new bluebird(function (resolve, reject) {
      log('info', 'starting copy', {readFd, writeFd});
      const done = _.once(function (error, result) {
        log('info', 'copy', 'done', {readFd, writeFd});

        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
      let readStream, writeStream;

      readStream = fs.createReadStream(src, {fd: readFd, autoClose: false})
        .on('error', done)
        .on('end', () => log('info', 'copy', 'readEnd'));

      writeStream = fs.createWriteStream(dest, {fd: writeFd, autoClose: false})
        .on('error', done)
        .on('finish', () => {
          log('info', 'copy', 'writeFinish');
          done();
        });

      readStream.pipe(writeStream);
    });
  });
}

function dispatch(ipcEmitter, data) {
  ipcEmitter.send('dispatch', 'files', data);
}

/**
 * We can't send functions across a network, so convert these functions into their results immediately
 * @param {fs.Stats} stats
 * @returns {object}
 */
function normalizeStats(stats) {
  if (stats) {
    stats.isDirectory = _.result(stats, 'isDirectory', false);
    stats.isFile = _.result(stats, 'isFile', false);
    stats.isSymbolicLink = _.result(stats, 'isSymbolicLink', false);
  }

  return stats;
}

function getFileSystemChangeToken(eventType, filePath, details) {
  details = normalizeStats(details);
  const event = {
    type: 'FILE_SYSTEM_CHANGED',
    eventType,
    path: filePath
  };

  // duck-typing: if details exists and has a property with this name
  if (details && details.isDirectory !== undefined) {
    details = normalizeStats(details);
    details.path = filePath;
    _.assign(details, path.parse(filePath));
    event.details = details;
  } else {
    log('info', 'HEEEEEY', eventType, filePath, details);
  }

  return event;
}

/**
 *
 * @param {object} ipcEmitter
 * @param {string} requesterId
 * @param {string|Array} fileTarget
 */
function startWatching(ipcEmitter, requesterId, fileTarget) {
  if (_.isArray(fileTarget)) {
    fileTarget = _.map(fileTarget, str => resolveHomeDirectory(str));
  } else if (_.isString(fileTarget)) {
    fileTarget = resolveHomeDirectory(fileTarget);
  }

  log('info', 'startWatching', requesterId, fileTarget);

  const watcher = chokidar.watch(fileTarget, {
    awaitWriteFinish: true,
    persistent: true,
    followSymlinks: false,
    usePolling: false,
    depth: 1, // graphics beyond this get weird,
    ignorePermissionErrors: false,
    ignored: [/[\/\\]\./, /rodeo.log/],
    ignoreInitial: true
  });

  watcher
    // .on('add', (path, stats) => log('info', `File ${path} has been added`, stats))
    // .on('change', (path, stats) => log('info', `File ${path} has been changed`, stats))
    // .on('unlink', path => log('info', `File ${path} has been removed`))
    // .on('addDir', (path, stats) => log('info', `Directory ${path} has been added`, stats))
    // .on('unlinkDir', path => log('info', `Directory ${path} has been removed`))
    // .on('error', error => log('info', `Watcher error: ${error}`))
    // .on('ready', () => log('info', 'Initial scan complete. Ready for changes'))
    .on('all', (eventType, path, details) => {
      const event = getFileSystemChangeToken(eventType, path, details);

      dispatch(ipcEmitter, event);
    });

  if (fileWatchers[requesterId]) {
    stopWatching(requesterId);
  }

  fileWatchers[requesterId] = watcher;
}

/**
 * @param {string} requesterId
 */
function stopWatching(requesterId) {
  if (requesterId) {
    fileWatchers[requesterId].close();
    delete fileWatchers[requesterId];
  } else {
    _.each(fileWatchers, watcher => watcher.close());
  }
}

/**
 * @param {string} requesterId
 * @param {string|Array} fileTarget
 */
function addWatching(requesterId, fileTarget) {
  if (_.isArray(fileTarget)) {
    fileTarget = _.map(fileTarget, str => resolveHomeDirectory(str));
  } else if (_.isString(fileTarget)) {
    fileTarget = resolveHomeDirectory(fileTarget);
  }

  log('info', 'addWatching', requesterId, fileTarget);

  if (fileWatchers[requesterId]) {
    fileWatchers[requesterId].add(fileTarget);
  }
}

function readFileStatsListIntoObject(fileStatsList) {
  return bluebird.reduce(fileStatsList,
    (knownSql, fileStats) => exports.readFile(fileStats.path)
      .then(contents => {
        knownSql[_.camelCase(fileStats.base)] = contents;

        return knownSql;
      }),
    {}
  );
}

function readAllFilesOfExt(filepath, ext) {
  return readDirectory(filepath)
    .filter(fileStatsList => fileStatsList.ext === ext)
    .then(readFileStatsListIntoObject);
}

function exists(filePath) {
  return getStats(filePath)
    .then(() => true)
    .catch(() => false);
}

/**
 * Do not fail if directory already exists
 * @param {string} filePath
 * @returns {Promise}
 */
function makeDirectorySafe(filePath) {
  return new bluebird((resolve, reject) => {
    fs.mkdir(filePath, function (e) {
      if (!e || (e && e.code === 'EEXIST')) {
        return resolve();
      }

      reject(e);
    });
  });
}

/**
 * @param {string} basePath
 * @param {[string]} directoryNames
 * @returns {Promise}
 */
function makeDirectoryPathSafe(basePath, directoryNames) {
  const currentPath = path.join(basePath, directoryNames[0]);

  return makeDirectorySafe(currentPath).then(() => {
    if (directoryNames.length > 1) {
      return makeDirectoryPathSafe(currentPath, _.tail(directoryNames));
    }
  });
}

export default {
  readFile: _.partialRight(bluebird.promisify(fs.readFile), 'utf8'),
  writeFile: bluebird.promisify(fs.writeFile),
  readDirectory,
  makeDirectory: bluebird.promisify(fs.mkdir),
  makeDirectoryPathSafe,
  makeDirectorySafe,
  getStats,
  exists,
  saveToTemporaryFile,
  resolveHomeDirectory,
  getWithHomeDirectoryShortName,
  copy,
  startWatching,
  stopWatching,
  addWatching,
  readAllFilesOfExt,
  unlink: bluebird.promisify(fs.unlink)
};
