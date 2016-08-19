import _ from 'lodash';
import ipc from 'ipc';
import {local} from './store';
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
    SHOW_ABOUT_RODEO: () => dialogActions.showAboutRodeo(),
    SHOW_ABOUT_STICKER: () => dialogActions.showAboutStickers(),
    SHOW_PREFERENCES: () => dialogActions.showPreferences(),
    CHECK_FOR_UPDATES: () => applicationActions.checkForUpdates(),
    TOGGLE_DEV_TOOLS: () => applicationActions.toggleDevTools(),
    QUIT: () => applicationActions.quit(),
    SAVE_ACTIVE_FILE: () => editorTabGroupActions.saveActiveFile(),
    SHOW_SAVE_FILE_DIALOG: () => editorTabGroupActions.showSaveFileDialogForActiveFile(),
    SHOW_OPEN_FILE_DIALOG: () => editorTabGroupActions.showOpenFileDialogForActiveFile(),
    FOCUS_ACTIVE_ACE_EDITOR: () => editorTabGroupActions.focus(),
    FOCUS_ACTIVE_TERMINAL: () => terminalActions.focus(),
    FOCUS_NEWEST_PLOT: () => plotViewerActions.focusNewestPlot(),
    TERMINAL_INTERRUPT: () => terminalActions.interrupt(),
    TERMINAL_RESTART: () => terminalActions.restart()
  },
  iopubDispatchMap = {
    executeInput: dispatchIOPubExecuteInput,
    stream: dispatchIOPubStream,
    executeResult: dispatchIOPubResult,
    displayData: dispatchIOPubDisplayData,
    error: dispatchIOPubError,
    status: dispatchIOPubStatus,
    commMsg: dispatchNoop,
    commOpen: dispatchNoop,
    clearOutput: dispatchNoop
  },
  shellDispatchMap = {
    executeReply: dispatchShellExecuteReply
  },
  stdinDispatchMap = {},
  browserWindowDispatchMap = {
    readyToShow: () => applicationActions.readyToShow()
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
      return dispatch(dispatchMap[action.type]());
    } else {
      return dispatch(action);
    }
  });
}

function dispatchShellExecuteReply(dispatch, content) {
  let payload = content && content.payload;

  // it's okay if lots of things have no payloads.  Ones that have payloads are really important though.
  _.each(payload, function (result) {
    const text = _.get(result, 'data["text/plain"]');

    if (text) {
      // this text includes ANSI color
      dispatch(terminalActions.addOutputBlock(text));
    } else {
      console.log('dispatchShellExecuteReply', 'unknown content type', result);
    }
  });
}

function dispatchIOPubResult(dispatch, content) {
  track({category:'iopub', action: 'execute_result'});
  let data = content && content.data,
    text = data && data['text/plain'];

  if (text) {
    dispatch(terminalActions.addOutputText(text));
  } else {
    console.log('dispatchIOPubResult', 'unknown content type', data);
  }

  dispatch(iopubActions.resultComputed(content.data));
  detectVariables(dispatch);
}

function dispatchIOPubDisplayData(dispatch, content) {
  track({category:'iopub', action: 'display_data'});
  dispatch(terminalActions.addDisplayData(content.data));
  dispatch(iopubActions.dataDisplayed(content.data));
  if (local.get('plotsFocusOnNew') !== false) {
    dispatch(plotViewerActions.focusNewestPlot());
  }
  detectVariables(dispatch);
}

function dispatchIOPubError(dispatch, content) {
  track({category:'iopub', action: 'error'});
  dispatch(terminalActions.addErrorText(content.ename, content.evalue, content.traceback));
  dispatch(iopubActions.errorOccurred(content.ename, content.evalue, content.traceback));
  detectVariables(dispatch);
}

function dispatchIOPubStream(dispatch, content) {
  track({category:'iopub', action: 'stream'});
  dispatch(terminalActions.addOutputText(content.text));
  dispatch(iopubActions.dataStreamed(content.name, content.text));
  detectVariables(dispatch);
}

function dispatchIOPubExecuteInput(dispatch, content) {
  track({category:'iopub', action: 'execute_input'});
  dispatch(iopubActions.inputExecuted(content.code));
  detectVariables(dispatch);
}

function dispatchIOPubStatus(dispatch, content) {
  // track({category:'iopub', action: 'status'}); // TOO MANY!~
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
      content = _.get(data, 'result.content'),
      type = result && _.camelCase(result.msg_type);

    if (iopubDispatchMap[type]) {
      return iopubDispatchMap[type](dispatch, content);
    }

    return dispatch(iopubActions.unknownEventOccurred(data));
  });
}

function shellDispatcher(dispatch) {
  ipc.on('shell', function (event, data) {
    const result = data.result,
      content = _.get(data, 'result.content'),
      type = result && _.camelCase(result.msg_type);

    if (shellDispatchMap[type]) {
      return shellDispatchMap[type](dispatch, content);
    }

    console.log('shell', {data});
  });
}

function stdinDispatcher(dispatch) {
  ipc.on('stdin', function (event, data) {
    const result = data.result,
      content = _.get(data, 'result.content'),
      type = result && _.camelCase(result.msg_type);

    if (stdinDispatchMap[type]) {
      return stdinDispatchMap[type](dispatch, content);
    }

    console.log('stdin', {data});
  });
}

function browserWindowDispatcher(dispatch) {
  ipc.on('browser-windows', function (event, eventName) {
    const args = _.slice(arguments, 2);

    if (browserWindowDispatchMap[eventName]) {
      return browserWindowDispatchMap[eventName].apply(null, [dispatch].concat(args));
    }

    console.log('browserWindow', eventName);
  });
}

function otherDispatcher(dispatch) {
  ipc.on('event', function (event, source, data) {
    // dispatch(terminalActions.addOutputText(source + ': ' + data));
    console.log('event', data);
  });

  ipc.on('error', function (event, data) {
    dispatch(terminalActions.addOutputText('Error: ' + JSON.stringify(data)));
    console.log('error', data);
  });

  ipc.on('close', function (event, data) {
    dispatch(terminalActions.addOutputText('Close: ' + JSON.stringify(data)));
    console.log('close', data);
  });

  ipc.on('sharedAction', function (event, action) {
    if (action.senderName) {
      dispatch(action);
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
  shellDispatcher(dispatch);
  stdinDispatcher(dispatch);
  browserWindowDispatcher(dispatch);
  internalDispatcher(dispatch);
  otherDispatcher(dispatch);
}
