import _ from 'lodash';
import ipc from './ipc';

import dialogActions from '../actions/dialogs';
import applicationActions from '../actions/application';
import acePaneActions from '../components/ace-pane/ace-pane.actions';
import iopubActions from '../actions/iopub';

const dispatchMap = {
  SHOW_ABOUT_RODEO: dialogActions.showAboutRodeo(),
  SHOW_ABOUT_STICKER: dialogActions.showAboutStickers(),
  SHOW_PREFERENCES: dialogActions.showPreferences(),
  CHECK_FOR_UPDATES: applicationActions.checkForUpdates(),
  TOGGLE_DEV_TOOLS: applicationActions.toggleDevTools(),
  QUIT: applicationActions.quit(),
  SAVE_ACTIVE_FILE: acePaneActions.saveActiveFile(),
  SHOW_SAVE_FILE_DIALOG: acePaneActions.showSaveFileDialogForActiveFile(),
  SHOW_OPEN_FILE_DIALOG: acePaneActions.showOpenFileDialogForActiveFile()
};

/**
 * @param {function} dispatch
 */
function internalDispatcher(dispatch) {
  ipc.on('dispatch', function (event, action) {
    if (dispatchMap[action.type]) {
      return dispatch(dispatchMap[action.type]);
    } else {
      return dispatch(action);
    }
  });
}

/**
 * Jupyter sends IOPUB events to broadcast to every client connected to a session.  Various components may be
 * listening and reacting to these independently, without connection to each other.
 * @param {function} dispatch
 */
function iopubDispatcher(dispatch) {
  ipc.on('iopub', function (event, data) {
    const result = data.result,
      content = _.get(data, 'result.content');

    if (result) {
      switch (result.msg_type) {
        case 'status':
          return dispatch(iopubActions.setTerminalState(content.execution_state));
        case 'execute_input':
          return Promise.all([
            dispatch(iopubActions.addTerminalExecutedInput(content.code)),
            dispatch(iopubActions.detectTerminalVariables())
          ]);
        case 'stream':
          return Promise.all([
            dispatch(iopubActions.addTerminalText(content.name, content.text)),
            dispatch(iopubActions.detectTerminalVariables())
          ]);
        case 'execute_result':
          return Promise.all([
            dispatch(iopubActions.addTerminalResult(content.data)),
            dispatch(iopubActions.detectTerminalVariables())
          ]);
        case 'display_data':
          return Promise.all([
            dispatch(iopubActions.addDisplayData(content.data)),
            dispatch(iopubActions.detectTerminalVariables())
          ]);
        case 'error':
          return Promise.all([
            dispatch(iopubActions.addTerminalError(content.ename, content.evalue, content.traceback)),
            dispatch(iopubActions.detectTerminalVariables())
          ]);
        default:
          return console.log('iopub', result, {event, data});
      }
    } else {
      console.log('iopub', {event, data});
    }
  });
}

function shellDispatcher() {
  ipc.on('shell', function (event, data) {
    console.log('shell', {data});
  });
}
function stdinDispatcher() {
  ipc.on('stdin', function (event, data) {
    const result = data.result;

    if (result) {
      switch (result.msg_type) {
        default:
          return console.log('stdin', result, {event, data});
      }
    } else {
      console.log('stdin', {event, data});
    }
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
  iopubDispatcher(dispatch);
  shellDispatcher();
  stdinDispatcher();
  internalDispatcher(dispatch);
}
