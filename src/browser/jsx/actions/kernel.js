/**
 * Kernel events can be triggered from several different components that want to interact with the underlying kernel.
 * @module
 */

import _ from 'lodash';
import ace from 'ace';
import { send } from 'ipc';
import {local} from '../services/store';
import client from '../services/client';
import clientDiscovery from '../services/client-discovery';
import {errorCaught} from './application';
import track from '../services/track';

function interrupt() {
  track({category: 'kernel', action: 'interrupt'});
  return function (dispatch) {
    dispatch({type: 'INTERRUPTING_KERNEL'});

    return send('interrupt')
      .then(() => dispatch({type: 'INTERRUPTED_KERNEL'}))
      .catch(error => dispatch(errorCaught(error)));
  };
}

function isBusy() {
  return {type: 'KERNEL_IS_BUSY'};
}

function isIdle() {
  return {type: 'KERNEL_IS_IDLE'};
}

function kernelDetected(pythonOptions) {
  track({category: 'kernel', action: 'kernel_detected'});
  // save over previous settings
  if (!pythonOptions.cmd) {
    throw new Error('Unacceptable python options without cmd that created it');
  }

  local.set('pythonOptions', pythonOptions);
  local.set('pythonCmd', pythonOptions.cmd);
  return {type: 'KERNEL_DETECTED', pythonOptions};
}

function askForPythonOptions() {
  track({category: 'kernel', action: 'ask_for_python_options'});
  return {type: 'ASK_FOR_PYTHON_OPTIONS'};
}

/**
 * Detect if the information we have about their kernel is good, and if it isn't,
 * try to auto-detect a working kernel
 * @returns {Function}
 */
function detectKernel() {
  return function (dispatch) {
    const pythonCmd = local.get('pythonCmd');
    let promise;

    if (pythonCmd) {
      // verify anyway
      promise = clientDiscovery.checkKernel({cmd: pythonCmd})
        .catch(() => clientDiscovery.getFreshPythonOptions());
    } else {
      // get them
      promise = clientDiscovery.getFreshPythonOptions();
    }

    return promise
      .then(pythonOptions => dispatch(kernelDetected(pythonOptions)))
      .catch(error => {
        console.warn('error using detected python', error);

        return dispatch(askForPythonOptions());
      });
  };
}

function restart() {
  return function (dispatch) {
    return client.restartInstance()
      .then(() => dispatch({type: 'KERNEL_RESTARTED'}))
      .then(() => dispatch(detectKernelVariables()))
      .catch(error => dispatch(errorCaught(error)));
  };
}

function detectKernelVariables() {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.head(state.terminals),
      id = terminal.id;

    return client.getStatus().then(function (status) {
      const variables = status.variables,
        cwd = status.cwd;

      dispatch({type: 'VARIABLES_CHANGED', variables, id});
      dispatch({type: 'WORKING_DIRECTORY_CHANGED', cwd, id});

      return status;
    }).catch(error => dispatch(errorCaught(error)));
  };
}

function executeActiveFileInActiveConsole() {
  return function (dispatch, getState) {
    const state = getState(),
      group = _.head(state.editorTabGroups),
      items = group.items,
      focusedAce = state && _.find(items, {id: group.active}),
      el = focusedAce && document.querySelector('#' + focusedAce.id),
      aceInstance = el && ace.edit(el),
      filename = focusedAce.filename,
      focusedTerminal = state && _.head(state.terminals),
      id = focusedTerminal.id,
      content = aceInstance && aceInstance.getSession().getValue();

    if (content) {
      dispatch({type: 'EXECUTING', filename, id});

      return client.execute(content)
        .then(() => dispatch({type: 'EXECUTED', id}))
        .catch(error => dispatch(errorCaught(error)));
    }
  };
}

function executeActiveFileSelectionInActiveConsole() {
  return function (dispatch, getState) {
    const state = getState(),
      group = _.head(state.editorTabGroups),
      items = group.items,
      focusedAce = state && _.find(items, {id: group.active}),
      el = focusedAce && document.querySelector('#' + focusedAce.id),
      aceInstance = el && ace.edit(el);

    if (aceInstance) {
      aceInstance.commands.exec('liftSelection', aceInstance);
    } else {
      dispatch(errorCaught(new Error('No active Ace instance')));
    }
  };
}

export default {
  askForPythonOptions,
  detectKernel,
  detectKernelVariables,
  executeActiveFileInActiveConsole,
  executeActiveFileSelectionInActiveConsole,
  isBusy,
  isIdle,
  interrupt,
  kernelDetected,
  restart
};
