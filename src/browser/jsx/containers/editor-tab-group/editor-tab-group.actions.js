import _ from 'lodash';
import {send} from 'ipc';
import ace from 'ace';
import store from '../../services/store';
import {errorCaught} from '../../actions/application';

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
      items = _.head(state.editorTabGroups).items,
      focusedAce = state && _.find(items, {hasFocus: true}),
      el = focusedAce && document.querySelector('#' + focusedAce.id),
      aceInstance = el && ace.edit(el),
      content = aceInstance && aceInstance.getSession().getValue();

    if (content) {
      return send('saveFile', filename, content)
        .then(() => dispatch(fileIsSaved(focusedAce.id, filename)))
        .catch(error => dispatch(errorCaught(error)));
    }
  };
}

export function saveActiveFile() {
  return function (dispatch, getState) {
    const state = getState(),
      items = _.head(state.editorTabGroups).items,
      focusedAce = state && _.find(items, {hasFocus: true}),
      el = focusedAce && document.querySelector('#' + focusedAce.id),
      aceInstance = el && ace.edit(el),
      filename = focusedAce.filename,
      content = aceInstance && aceInstance.getSession().getValue();

    if (!filename) {
      return dispatch(showSaveFileDialogForActiveFile());
    }

    if (content) {
      return send('saveFile', filename, content)
        .then(() => dispatch(fileIsSaved(focusedAce.id, focusedAce.filename)))
        .catch(error => dispatch(errorCaught(error)));
    }
  };
}

/**
 * @returns {function}
 */
export function showSaveFileDialogForActiveFile() {
  return function (dispatch, getState) {
    const state = getState(),
      items = _.head(state.editorTabGroups).items,
      focusedAce = state && _.find(items, {hasFocus: true}),
      title = 'Save File',
      defaultPath = focusedAce && focusedAce.filename ? focusedAce.filename : store.get('workingDirectory');

    return send('saveDialog', {title, defaultPath})
      .then(function (filename) {
        if (_.isArray(filename)) {
          filename = filename[0];
        }

        return dispatch(saveActiveFileAs(filename));
      })
      .catch(error => dispatch(errorCaught(error)));
  };
}

export function showOpenFileDialogForActiveFile() {
  return function (dispatch) {
    return send('openDialog', {
      title: 'Select a file to open',
      defaultPath: store.get('workingDirectory'),
      properties: ['openFile']
    }).then(function (filename) {
      if (_.isArray(filename)) {
        filename = filename[0];
      }

      return send('fileStats', filename)
        .then(stats => dispatch(addFile(filename, stats)));
    }).catch(error => dispatch(errorCaught(error)));
  };
}

function focus() {
  return function (dispatch, getState) {
    const state = getState(),
      items = _.head(state.editorTabGroups).items,
      focusedAce = state && _.find(items, {hasFocus: true}),
      el = focusedAce && document.querySelector('#' + focusedAce.id),
      aceInstance = el && ace.edit(el);

    aceInstance.focus();

    dispatch(focusFile(focusedAce.id));
  };
}

export default {
  addFile,
  focus,
  focusFile,
  closeFile,
  fileIsSaved,
  saveActiveFile,
  showSaveFileDialogForActiveFile,
  showOpenFileDialogForActiveFile
};
