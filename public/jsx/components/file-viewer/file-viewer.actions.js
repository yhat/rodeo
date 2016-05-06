import _ from 'lodash';
import {send} from '../../services/ipc';
import {addFile} from '../../actions/file';

export function openViewedFile(file) {
  return function (dispatch, getState) {
    const state = getState(),
      filename = state.fileView.path + '/' + file.filename;

    console.log('openViewedFile', file, filename);

    if (file.isDirectory) {
      return dispatch(getViewedFiles(filename));
    } else {
      return send('file_stats', filename)
        .then(stats => dispatch(addFile(filename, stats)));
    }
  };
}

export function selectViewedFile(file) {
  return {type: 'SELECT_VIEWED_FILE', file};
}

export function getViewedFiles(filePath) {
  return function (dispatch) {
    console.log('getViewedFiles', filePath);

    return send('files', filePath)
      .then(files => dispatch({type: 'LIST_VIEWED_FILES', path: filePath, files}))
      .catch(error => console.error(error));
  };
}

export function goToParentDirectory() {
  return function (dispatch, getState) {
    const fileView = getState().fileView,
      newPath = _.dropRight(fileView.path.split('/'), 1).join('/');

    console.log('goToParentDirectory');

    dispatch(getViewedFiles(newPath));
  };
}