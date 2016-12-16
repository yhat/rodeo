import _ from 'lodash';
import ipc from 'ipc';
import {local, session} from './store';
import track from './track';
import dialogActions from '../actions/dialogs';
import applicationActions from '../actions/application';
import editorTabGroupActions from '../containers/editor-tab-group/editor-tab-group.actions';
import freeTabGroupActions from '../containers/free-tab-group/free-tab-group.actions';
import kernelActions from '../actions/kernel';
import jupyterResponse from './jupyter/response';

/**
 * These are dispatched from the server, usually from interaction with native menus.
 *
 * @namespace
 */
const dispatchMap = {
    SHOW_ABOUT_RODEO: () => dialogActions.showAboutRodeo(),
    SHOW_ABOUT_STICKER: () => dialogActions.showAboutStickers(),
    SHOW_PREFERENCES: () => dialogActions.showPreferences(),
    CHECK_FOR_UPDATES: () => applicationActions.checkForUpdates(),
    TOGGLE_DEV_TOOLS: () => applicationActions.toggleDevTools(),
    QUIT: () => dialogActions.showAskQuit(),
    ASK_QUIT: () => dialogActions.showAskQuit(),
    SAVE_ACTIVE_FILE: () => editorTabGroupActions.saveActiveFile(),
    SHOW_SAVE_FILE_DIALOG: () => editorTabGroupActions.showSaveFileDialogForActiveFile(),
    SHOW_OPEN_FILE_DIALOG: () => editorTabGroupActions.showOpenFileDialogForActiveFile(),
    FOCUS_ACTIVE_ACE_EDITOR: () => editorTabGroupActions.focusActive(),
    FOCUS_ACTIVE_TERMINAL: () => freeTabGroupActions.focusFirstTabByType('document-terminal-viewer'),
    FOCUS_NEWEST_PLOT: () => freeTabGroupActions.focusNewestPlot(),
    TERMINAL_INTERRUPT: () => kernelActions.interrupt(),
    TERMINAL_RESTART: () => kernelActions.restart()
  },
  detectVariables = _.debounce(function (dispatch) {
    dispatch(kernelActions.detectKernelVariables());
  }, 500),
  detectVariableEvents = {
    execute_result: {},
    display_data: {},
    execute_reply: {}
  };

function internalDispatcher(dispatch) {
  ipc.on('dispatch', function (event, action) {
    if (dispatchMap[action.type]) {
      return dispatch(dispatchMap[action.type]());
    } else {
      return dispatch(action);
    }
  });
}

function isCurious(groups, responseMsgId) {
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const tabs = groups[groupIndex].tabs;

    for (let tabIndex = 0; tabIndex < tabs.length; tabIndex++) {
      const tab = tabs[tabIndex];

      if (tab.contentType === 'document-terminal-viewer' && tab.content.responses[responseMsgId]) {
        return true;
      }

      if (tab.contentType === 'block-terminal-viewer' && _.some(tab.content.blocks, {id: responseMsgId})) {
        return true;
      }
    }
  }

  return false;
}

function otherDispatcher(dispatch) {
  ipc.on('error', (event, clientId, error) => {
    if (error && (error.message || error.name)) {
      track({hitType: 'exception', exceptionDescription: error.message || error.name, isExceptionFatal: false});
    }

    dispatch({type: 'JUPYTER_PROCESS_ERROR', payload: {clientId, error}, error: true});

    if (error.code || error.missingPackage) {
      const pythonCmd = local.get('pythonCmd'),
        useBuiltinPython = local.get('useBuiltinPython') || 'failover',
        hasPythonFailedOver = session.get('hasPythonFailedOver') || false,
        isDefaultPythonCmd = !pythonCmd || pythonCmd === 'python';

      if (isDefaultPythonCmd && useBuiltinPython === 'failover' && !hasPythonFailedOver) {
        console.warn('Using built-in python.');
        session.set('hasPythonFailedOver', {time: new Date().getTime(), clientId});
        // local.set('kernelName', 'rodeo-builtin-miniconda');
        local.set('restartKernelOnCloseProcess', true);
      } else if (hasPythonFailedOver && hasPythonFailedOver.clientId !== clientId) {
        // if this is the second time we've failed over
        session.set('hasPythonFailedOver', false);
        dispatch(applicationActions.showStartupWindow());
      }
    }
  });
  ipc.on('close', (event, clientId, code, signal) => {
    dispatch({type: 'JUPYTER_PROCESS_CLOSED', payload: {clientId, code, signal}});

    if (local.get('restartKernelOnCloseProcess') === true) {
      local.set('restartKernelOnCloseProcess', false);
      dispatch(kernelActions.restart());
    }
  });
  ipc.on('jupyter', function (event, clientId, response) {
    const category = response.source,
      action = _.get(response, 'result.msg_type'),
      responseMsgId = _.get(response, 'result.parent_header.msg_id');

    if (category && action) {
      track({category, action, value: 1});
    }

    jupyterResponse.handle(dispatch, response);

    if (detectVariableEvents[action]) {
      // if the parent id matches any of the things we're looking for, detect state as well

      dispatch(function (dispatch, getState) {
        const state = getState();

        if (isCurious(state.freeTabGroups, responseMsgId)) {
          detectVariables(dispatch);
        }
      });
    }
  });

  ipc.on('sharedAction', function (event, action) {
    // if there is a sender, allow it
    if (action.meta && action.meta.sender) {
      dispatch(action);
    }
  });

  ipc.on('files', function (event, clientId, data) {
    console.log('files', data);
  });

  ipc.on('getTabs', function () {
    return dispatch(function (dispatch, getState) {
      const state = getState();

      return _.pick(state, ['freeTabGroups', 'editorTabGroups']);
    });
  });
}

/**
 * The node process will always forward events to the UI here to give a chance to respond to them.
 *
 * An application like this should be UI-driven, so even if the
 * node process could do something on its own, it _shouldn't_.
 * @param {function} dispatch
 */
export default function (dispatch) {
  internalDispatcher(dispatch);
  otherDispatcher(dispatch);
}
