import _ from 'lodash';
import ipc from 'ipc';
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
    QUIT: () => applicationActions.quit(),
    SAVE_ACTIVE_FILE: () => editorTabGroupActions.saveActiveFile(),
    SHOW_SAVE_FILE_DIALOG: () => editorTabGroupActions.showSaveFileDialogForActiveFile(),
    SHOW_OPEN_FILE_DIALOG: () => editorTabGroupActions.showOpenFileDialogForActiveFile(),
    FOCUS_ACTIVE_ACE_EDITOR: () => editorTabGroupActions.focusActive(),
    FOCUS_ACTIVE_TERMINAL: () => freeTabGroupActions.focusTerminal(),
    FOCUS_NEWEST_PLOT: () => freeTabGroupActions.focusPlot(),
    TERMINAL_INTERRUPT: () => freeTabGroupActions.interruptTerminal(null),
    TERMINAL_RESTART: () => freeTabGroupActions.restartTerminal(null)
  },
  detectVariables = _.debounce(function (dispatch) {
    dispatch(kernelActions.detectKernelVariables());
  }, 500),
  detectVariableEvents = {
    'execute_result': {},
    'display_data': {},
    'execute_reply': {}
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

function otherDispatcher(dispatch) {
  ipc.on('error', (event, clientId, data) => dispatch({type: 'JUPYTER_PROCESS_ERROR', clientId, data}));
  ipc.on('close', (event, clientId, code, signal) => dispatch({type: 'JUPYTER_PROCESS_CLOSED', clientId, code, signal}));

  ipc.on('jupyter', function (event, clientId, response) {
    const category = response.source,
      action = _.get(response, 'result.msg_type'),
      responseMsgId = _.get(response, 'result.parent_header.msg_id');

    if (category && action) {
      track({category, action});
    }

    jupyterResponse.handle(dispatch, response);

    if (detectVariableEvents[action]) {
      // if the parent id matches any of the things we're looking for, detect state as well

      dispatch(function (dispatch, getState) {
        const state = getState();
        let isCurious = false;

        _.each(state.freeTabGroups, group => {
          _.each(group.tabs, tab => {
            if (tab.contentType === 'document-terminal-viewer' && tab.content.responses[responseMsgId]) {
              isCurious = true;
            }

            if (tab.contentType === 'block-terminal-viewer' && _.some(tab.content.blocks, {id: responseMsgId})) {
              isCurious = true;
            }
          });
        });

        if (isCurious) {
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
