import _ from 'lodash';
import api from './api';
import cid from './cid';
import path from 'path';

function normalizeFileStats(file) {
  file.cid = cid();

  return file;
}

function getFiles(filePath) {
  return api.send('files', filePath)
    .then(function (result) {
      const files = result.files;

      for (let i = 0; i < files.length; i++) {
        normalizeFileStats(files[i]);
      }

      return result;
    });
}

function getFileStats(filePath) {
  return api.send('fileStats', filePath)
    .then(normalizeFileStats);
}

function startWatching(requesterId, targetFiles) {
  return api.send('startWatchingFiles', requesterId, targetFiles);
}

function stopWatching(requesterId) {
  return api.send('stopWatchingFiles', requesterId);
}

function addWatchingFiles(requesterId, targetFiles) {
  return api.send('addWatchingFiles', requesterId, targetFiles);
}

/**
 * This might be moved to the server later, so temporarily stub it here
 *
 * Or maybe this will be replaced with pure logic to avoid the call.
 *
 * @param {string} filePath
 * @returns {string}
 */
function getParent(filePath) {
  return path.resolve(filePath, '..');
}

/**
 * Get an index path, i.e.,  [42, 'items', 63, 'items', 2]
 *
 * Used in combination with seamless-immutable like:
 *
 * state = state.updateIn(getIndexPath(files, '/someplace/nice'));
 *
 * @param {Array} files
 * @param {string} targetPath
 * @returns {Array}
 */
function getIndexPath(files, targetPath) {
  const indexPath = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file.path === targetPath) {
      indexPath.push(i);
      return indexPath;
    } else if (_.isArray(file.items) && _.startsWith(targetPath, file.path)) {
      indexPath.push(i);
      files = file.items;
      indexPath.push('items');
      i = -1;
    }
  }

  return null;
}

export default {
  addWatchingFiles,
  getFiles,
  getFileStats,
  getIndexPath,
  getParent,
  startWatching,
  stopWatching
};
