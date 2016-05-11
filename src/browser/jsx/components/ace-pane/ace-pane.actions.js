import _ from 'lodash';
import {send} from '../../services/ipc';
import ace from 'ace';
import * as store from '../../services/store';

/**
 * @param {string} [filename]
 * @param {object} [stats]
 * @returns {{type: string, filename: string, stats: object}}
 */
export function addFile(filename, stats) {
  return {type: 'ADD_FILE', filename, stats};
}

/**
 * @param {string} id
 * @returns {{type: string, id: string}}
 */
export function focusFile(id) {
  return {type: 'FOCUS_FILE', id};
}

/**
 * @param {string} id
 * @returns {{type: string, id: string}}
 */
export function closeFile(id) {
  return {type: 'CLOSE_FILE', id};
}

/**
 * @param {string} id
 * @param {string} [filename]
 * @returns {{type: string, id: string, filename: string}}
 */
export function fileIsSaved(id, filename) {
  return {type: 'FILE_IS_SAVED', id, filename};
}

/**
 * @param {string} filename
 * @returns {Function}
 */
export function saveActiveFileAs(filename) {
  return function (dispatch, getState) {
    const state = getState(),
      focusedAce = state && _.find(state.acePanes, {hasFocus: true}),
      el = focusedAce && document.querySelector('#' + focusedAce.id),
      aceInstance = el && ace.edit(el),
      content = aceInstance && aceInstance.getSession().getValue();

    return send('save_file', filename, content)
      .then(() => dispatch(fileIsSaved(focusedAce.id, filename)))
      .catch(error => console.error(error));
  };
}

export function saveActiveFile() {
  return function (dispatch, getState) {
    const state = getState(),
      focusedAce = state && _.find(state.acePanes, {hasFocus: true}),
      el = focusedAce && document.querySelector('#' + focusedAce.id),
      aceInstance = el && ace.edit(el),
      filename = focusedAce.filename,
      content = aceInstance && aceInstance.getSession().getValue();

    if (!filename) {
      return dispatch(showSaveFileDialogForActiveFile());
    }

    return send('save_file', filename, content)
      .then(() => dispatch(fileIsSaved(focusedAce.id)))
      .catch(error => console.error(error));
  };
}

/**
 * @returns {function}
 */
export function showSaveFileDialogForActiveFile() {
  return function (dispatch) {
    return send('save_dialog', {
      title: 'Save File',
      defaultPath: store.get('workingDirectory')
    }).then(function (filename) {
      if (_.isArray(filename)) {
        filename = filename[0];
      }

      return dispatch(saveActiveFileAs(filename));
    }).catch(error => console.error(error));
  };
}

export function showOpenFileDialogForActiveFile() {
  return function (dispatch) {
    return send('open_dialog', {
      title: 'Select a file to open',
      defaultPath: store.get('workingDirectory'),
      properties: ['openFile']
    }).then(function (filename) {
      if (_.isArray(filename)) {
        filename = filename[0];
      }

      return send('file_stats', filename)
        .then(stats => dispatch(addFile(filename, stats)));
    }).catch(error => console.error(error));
  };
}

export default {
  addFile,
  focusFile,
  closeFile,
  fileIsSaved,
  saveActiveFile,
  showSaveFileDialogForActiveFile,
  showOpenFileDialogForActiveFile
};
