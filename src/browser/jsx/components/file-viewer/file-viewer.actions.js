import _ from 'lodash';
import {send} from '../../services/ipc';
import {addFile} from '../ace-pane/ace-pane.actions';

/**
 * @param {string} file
 * @returns {function}
 */
export function openViewedFile(file) {
  return function (dispatch, getState) {
    const state = getState(),
      filename = state.fileView.path + '/' + file.filename;

    if (file.isDirectory) {
      return dispatch(getViewedFiles(filename));
    } else {
      return send('file_stats', filename)
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
 * @param {string} filePath
 * @returns {function}
 */
export function getViewedFiles(filePath) {
  return function (dispatch) {
    return send('files', filePath)
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
      newPath = _.dropRight(fileView.path.split('/'), 1).join('/');

    dispatch(getViewedFiles(newPath));
  };
}

export default {
  openViewedFile,
  selectViewedFile,
  getViewedFiles,
  goToParentDirectory
};