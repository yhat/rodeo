import _ from 'lodash';
import {send} from 'ipc';
import ace from 'ace';
import {local} from '../../services/store';
import {errorCaught} from '../../actions/application';
import aceActions from './ace.actions';
import commonTabsActions from '../../services/common-tabs-actions';
import freeTabGroupActions from '../free-tab-group/free-tab-group.actions';
const tabGroupName = 'editorTabGroups';

function getAceInstance(id) {
  const tabEl = document.querySelector('#' + id),
    el = tabEl && tabEl.querySelector('.ace-pane');

  return el && ace.edit(el);
}

/**
 * @param {string} groupId
 * @param {string} [filename]
 * @param {object} [stats]
 * @returns {{type: string, filename: string, stats: object}}
 */
export function add(groupId, filename, stats) {
  return {type: 'ADD_TAB', groupId, filename, stats};
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
 * @param {string} groupId
 * @param {string} id
 * @param {string} [filename]
 * @returns {{type: string, id: string, filename: string}}
 */
export function fileIsSaved(groupId, id, filename) {
  return {type: 'FILE_IS_SAVED', groupId, id, filename};
}

/**
 * @param {string} filename
 * @returns {Function}
 */
export function saveActiveFileAs(filename) {
  return function (dispatch, getState) {
    const state = getState(),
      groupIndex = 0, // assume for now
      group = state[tabGroupName][groupIndex],
      focusedAce = _.find(group.tabs, {id: group.active}),
      aceInstance = focusedAce && getAceInstance(focusedAce.id),
      content = aceInstance && aceInstance.getSession().getValue();

    if (_.isString(content)) {
      return send('saveFile', filename, content)
        .then(() => dispatch(fileIsSaved(group.groupId, focusedAce.id, filename)))
        .catch(error => dispatch(errorCaught(error)));
    }
  };
}

export function saveActiveFile() {
  return function (dispatch, getState) {
    const state = getState(),
      groupIndex = 0, // assume for now
      group = state[tabGroupName][groupIndex],
      focusedAce = _.find(group.tabs, {id: group.active}),
      aceInstance = focusedAce && getAceInstance(focusedAce.id),
      filename = _.get(focusedAce, 'content.filename'),
      content = aceInstance && aceInstance.getSession().getValue();

    if (!filename) {
      return dispatch(showSaveFileDialogForActiveFile());
    }

    if (_.isString(content)) {
      return send('saveFile', filename, content)
        .then(() => dispatch(fileIsSaved(group.groupId, focusedAce.id, focusedAce.content.filename)))
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
      groupIndex = 0, // assume for now
      group = state[tabGroupName][groupIndex],
      focusedAce = _.find(group.tabs, {id: group.active}),
      title = 'Save File',
      filename = focusedAce && focusedAce.content && focusedAce.content.filename,
      defaultPath = filename || (local.get('workingDirectory') || '~');

    return send('saveDialog', {title, defaultPath})
      .then(filename => dispatch(saveActiveFileAs(filename)))
      .catch(error => dispatch(errorCaught(error)));
  };
}

export function showOpenFileDialogForActiveFile() {
  return function (dispatch, getState) {
    const state = getState(),
      group = _.head(state[tabGroupName]),
      groupId = group.groupId;

    return send('openDialog', {
      title: 'Select a file to open',
      defaultPath: local.get('workingDirectory'),
      properties: ['openFile']
    }).then(function (filename) {
      if (_.isArray(filename)) {
        filename = filename[0];
      }

      if (_.isString(filename) && filename.length > 0) {
        return send('fileStats', filename)
          .then(stats => dispatch(add(groupId, filename, stats)));
      }
    }).catch(error => dispatch(errorCaught(error)));
  };
}

function focusActive() {
  return function (dispatch, getState) {
    let group, groupId, focusedAce, aceInstance;
    const state = getState();

    group = _.head(state[tabGroupName]);
    groupId = group.groupId;
    focusedAce = state && _.find(group.tabs, {id: group.active});
    aceInstance = getAceInstance(focusedAce.id);
    dispatch(focus(groupId, group.active));

    if (aceInstance) {
      aceInstance.focus();
    }
  };
}

function handleLoadError(tab) {
  return function () {
    console.log(__filename, 'handleLoadError', tab);
  };
}

function handleLoading(tab) {
  return function () {
    console.log(__filename, 'handleLoading', tab);
  };
}

function handleLoaded(tab) {
  return function () {
    console.log(__filename, 'handleLoaded', tab);
  };
}

/**
 * The difference between this and this#executeAceCommand is that this triggers the command from within an Ace instance,
 * which then leads to the execution of this#executeAceCommand
 *
 * If we want to do something to Ace that isn't in our codebase, we can use this to trigger that particalur command
 *
 * Examples of that:  Copy, Paste, Cut, Tabs, etc...
 *
 * @param {string} groupId
 * @param {string} id
 * @param {string} commandName
 * @returns {function}
 */
function triggerAceCommand(groupId, id, commandName) {
  return function () {
    const aceInstance = getAceInstance(id);

    if (aceInstance) {
      aceInstance.commands.exec(commandName, aceInstance);
    }
  };
}

function changeTabMode(groupId, id, option) {
  return {type: 'EDITOR_TAB_MODE_CHANGED', groupId, id, value: option.value};
}

function executeAceCommand(groupId, id, command, editor) {
  if (aceActions[command.name]) {
    return aceActions[command.name](groupId, id, editor);
  }

  return _.noop;
}

function execute(groupId, id, payload) {
  return function (dispatch, getState) {
    const state = getState(),
      editorTabContents = commonTabsActions.getContent(state[tabGroupName], groupId, id);

    return dispatch(freeTabGroupActions.execute(_.assign({mode: editorTabContents.mode}, payload)));
  };
}

export default {
  add,
  focus,
  focusActive,
  changeTabMode,
  close,
  execute,
  executeAceCommand,
  triggerAceCommand,
  triggerAceCommandForActiveTab: commonTabsActions.toActiveTab(tabGroupName, triggerAceCommand),
  fileIsSaved,
  saveActiveFile,
  showSaveFileDialogForActiveFile,
  showOpenFileDialogForActiveFile,
  handleLoadError,
  handleLoading,
  handleLoaded
};
