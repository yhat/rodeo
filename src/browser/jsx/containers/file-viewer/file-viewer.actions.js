import _ from 'lodash';
import path from 'path';
import {send} from 'ipc';
import {addFile} from '../../containers/editor-tab-group/editor-tab-group.actions';

/**
 * @param {string} file
 * @returns {function}
 */
export function openViewedFile(file) {
  return function (dispatch, getState) {
    const state = getState(),
      filename = path.join(state.fileView.path, file.filename);

    if (file.isDirectory) {
      return dispatch(getViewedFiles(filename));
    } else {
      return send('fileStats', filename)
        .then(stats => dispatch(addFile(filename, stats)));
    }
  };
}

/**
 * @param {object} file
 * @returns {{type: string, file: object}}
 */
export function selectViewedFile(file) {
  return {type: 'SELECT_VIEWED_FILE', file};
}

/**
 * NOTE: Accepts ~ as a path start as well
 *
 * @param {string} filePath
 * @returns {function}
 */
export function getViewedFiles(filePath) {
  return function (dispatch) {
    return send('resolveFilePath', filePath)
      .then(expandedPath => send('files', expandedPath))
      .then(files => dispatch({type: 'LIST_VIEWED_FILES', path: filePath, files}))
      .catch(error => console.error(error));
  };
}

/**
 * @returns {function}
 */
export function goToParentDirectory() {
  return function (dispatch, getState) {
    const fileView = getState().fileView,
      newPath = _.dropRight(fileView.path.split(path.sep), 1).join(path.sep);

    if (newPath) {
      dispatch(getViewedFiles(newPath));
    }
  };
}

export default {
  openViewedFile,
  selectViewedFile,
  getViewedFiles,
  goToParentDirectory
};
