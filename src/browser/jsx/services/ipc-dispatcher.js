import _ from 'lodash';
import ipc from 'ipc';
import store from './store';
import track from './track';

import dialogActions from '../actions/dialogs';
import applicationActions from '../actions/application';
import editorTabGroupActions from '../containers/editor-tab-group/editor-tab-group.actions';
import terminalActions from '../containers/terminal/terminal.actions';
import iopubActions from '../actions/iopub';
import kernelActions from '../actions/kernel';
import plotViewerActions from '../containers/plot-viewer/plot-viewer.actions';

/**
 * These are dispatched from the server, usually from interaction with native menus.
 *
 * @namespace
 */
const dispatchMap = {
    SHOW_ABOUT_RODEO: dialogActions.showAboutRodeo(),
    SHOW_ABOUT_STICKER: dialogActions.showAboutStickers(),
    SHOW_PREFERENCES: dialogActions.showPreferences(),
    CHECK_FOR_UPDATES: applicationActions.checkForUpdates(),
    TOGGLE_DEV_TOOLS: applicationActions.toggleDevTools(),
    QUIT: applicationActions.quit(),
    SAVE_ACTIVE_FILE: editorTabGroupActions.saveActiveFile(),
    SHOW_SAVE_FILE_DIALOG: editorTabGroupActions.showSaveFileDialogForActiveFile(),
    SHOW_OPEN_FILE_DIALOG: editorTabGroupActions.showOpenFileDialogForActiveFile(),
    FOCUS_ACTIVE_ACE_EDITOR: editorTabGroupActions.focus(),
    FOCUS_ACTIVE_TERMINAL: terminalActions.focus(),
    FOCUS_NEWEST_PLOT: plotViewerActions.focusNewestPlot(),
    TERMINAL_INTERRUPT: terminalActions.interrupt(),
    TERMINAL_RESTART: terminalActions.restart()
  },
  iopubDispatchMap = {
    execute_input: dispatchIOPubExecuteInput,
    stream: dispatchIOPubStream,
    execute_result: dispatchIOPubResult,
    display_data: dispatchIOPubDisplayData,
    error: dispatchIOPubError,
    status: dispatchIOPubStatus,
    comm_msg: dispatchNoop,
    comm_open: dispatchNoop,
    clear_output: dispatchNoop
  },
  detectVariables = _.debounce(function (dispatch) {
    dispatch(kernelActions.detectKernelVariables());
  }, 500);

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

function dispatchIOPubResult(dispatch, content) {
  track('iopub', 'execute_result');
  let text = _.get(content, 'data["text/plain"]');

  if (text) {
    dispatch(terminalActions.addOutputText(text));
  }

  dispatch(iopubActions.resultComputed(content.data));
  detectVariables(dispatch);
}

function dispatchIOPubDisplayData(dispatch, content) {
  track('iopub', 'display_data');
  dispatch(terminalActions.addDisplayData(content.data));
  dispatch(iopubActions.dataDisplayed(content.data));
  if (store.get('plotsFocusOnNew') !== false) {
    dispatch(plotViewerActions.focusNewestPlot());
  }
  detectVariables(dispatch);
}

function dispatchIOPubError(dispatch, content) {
  track('iopub', 'error');
  dispatch(terminalActions.addErrorText(content.ename, content.evalue, content.traceback));
  dispatch(iopubActions.errorOccurred(content.ename, content.evalue, content.traceback));
  detectVariables(dispatch);
}

function dispatchIOPubStream(dispatch, content) {
  track('iopub', 'stream');
  dispatch(terminalActions.addOutputText(content.text));
  dispatch(iopubActions.dataStreamed(content.name, content.text));
  detectVariables(dispatch);
}

function dispatchIOPubExecuteInput(dispatch, content) {
  track('iopub', 'execute_input');
  dispatch(iopubActions.inputExecuted(content.code));
  detectVariables(dispatch);
}

function dispatchIOPubStatus(dispatch, content) {
  track('iopub', 'status');
  dispatch(iopubActions.stateChanged(content.execution_state));
}

function dispatchNoop() {
  // eat it; we don't care about these yet
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

    if (result && iopubDispatchMap[result.msg_type]) {
      return iopubDispatchMap[result.msg_type](dispatch, content);
    }

    return dispatch(iopubActions.unknownEventOccurred(data));
  });
}

function shellDispatcher() {
  ipc.on('shell', function (event, data) {
    console.log('shell', {data});
  });
}

function stdinDispatcher() {
  ipc.on('stdin', function (event, data) {
    console.log('stdin', {event, data});
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
