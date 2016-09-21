import path from 'path';
import {send} from 'ipc';
import editorTabGroupActions from '../../containers/editor-tab-group/editor-tab-group.actions';

/**
 * @param {string} file
 * @returns {function}
 */
export function openViewedFile(file) {
  return function (dispatch, getState) {
    const state = getState(),
      filename = path.join(state.fileView.path, file.filename);

    if (file.isDirectory) {
      return dispatch(setViewedPath(filename));
    } else if (state.editorTabGroups.length) {
      // find first editorTabGroup, put it there
      const groupId = state.editorTabGroups[0].groupId;

      return send('fileStats', filename)
        .then(stats => dispatch(editorTabGroupActions.add(groupId, filename, stats)));

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
  return function (dispatch, getState) {
    console.log('getViewedFiles', filePath);

    if (!filePath) {
      const state = getState();

      filePath = state.fileView.path;
    }

    return send('files', filePath)
      .then(files => dispatch({type: 'LIST_VIEWED_FILES', path: filePath, files}))
      .catch(error => console.error(error));
  };
}

function setViewedPath(filePath) {
  return function (dispatch) {
    console.log('setViewedPath, filePath', filePath);

    return send('files', filePath)
      .then(files => dispatch({type: 'SET_VIEWED_PATH', path: filePath, files}))
      .catch(error => console.error(error));
  };
}

/**
 * @returns {function}
 */
export function goToParentDirectory() {
  return function (dispatch, getState) {
    const fileView = getState().fileView;

    dispatch(setViewedPath(path.resolve(fileView.path, '..')));
  };
}

export default {
  openViewedFile,
  selectViewedFile,
  setViewedPath,
  getViewedFiles,
  goToParentDirectory
};
