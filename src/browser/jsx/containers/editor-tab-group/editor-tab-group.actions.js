import _ from 'lodash';
import {send} from 'ipc';
import ace from 'ace';
import {local} from '../../services/store';
import {errorCaught} from '../../actions/application';

/**
 * @param {string} groupId
 * @param {string} id
 * @param {string} [filename]
 * @param {object} [stats]
 * @returns {{type: string, filename: string, stats: object}}
 */
export function add(groupId, id, filename, stats) {
  return {type: 'ADD_TAB', groupId, id, filename, stats};
}

/**
 * @param {string} groupId
 * @param {string} id
 * @returns {{type: string, groupId: string, id: string}}
 */
export function focus(groupId, id) {
  return {type: 'FOCUS_TAB', groupId, id};
}

/**
 * @param {string} groupId
 * @param {string} id
 * @returns {{type: string, id: string}}
 */
export function close(groupId, id) {
  return {type: 'CLOSE_TAB', groupId, id};
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
      group = _.head(state.editorTabGroups),
      items = group.items,
      focusedAce = state && _.find(items, {id: group.active}),
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
      group = _.head(state.editorTabGroups),
      items = group.items,
      focusedAce = state && _.find(items, {id: group.active}),
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
      group = _.head(state.editorTabGroups),
      items = group.items,
      focusedAce = state && _.find(items, {id: group.active}),
      title = 'Save File',
      filename = focusedAce && focusedAce.filename,
      defaultPath = filename || (local.get('workingDirectory') || '~');

    return send('saveDialog', {title, defaultPath, filters: [{ name: 'Python', extensions: ['py'] }]})
      .then(filename => dispatch(saveActiveFileAs(filename)))
      .catch(error => dispatch(errorCaught(error)));
  };
}

export function showOpenFileDialogForActiveFile() {
  return function (dispatch) {
    return send('openDialog', {
      title: 'Select a file to open',
      defaultPath: local.get('workingDirectory'),
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

function focusActive() {
  return function (dispatch, getState) {
    let group, groupId, focusedAce, el, aceInstance;
    const state = getState();

    group = _.head(state.editorTabGroups);
    groupId = group.groupId;
    focusedAce = state && _.find(group.items, {id: group.active});
    el = focusedAce && document.querySelector('#' + focusedAce.id);
    aceInstance = el && ace.edit(el);
    dispatch(focus(groupId, group.active));

    if (aceInstance) {
      aceInstance.focus();
    }
  };
}

export default {
  add,
  focus,
  focusActive,
  close,
  fileIsSaved,
  saveActiveFile,
  showSaveFileDialogForActiveFile,
  showOpenFileDialogForActiveFile
};
