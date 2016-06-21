/**
 * Kernel events can be triggered from several different components that want to interact with the underlying kernel.
 * @module
 */

import _ from 'lodash';
import ace from 'ace';
import { send } from 'ipc';
import * as store from '../services/store';
import client from '../services/client';
import clientDiscovery from '../services/client-discovery';
import {errorCaught} from './application';
import track from '../services/track';

export function interrupt() {
  track('kernel','interrupt');
  return function (dispatch) {
    dispatch({type: 'INTERRUPTING_KERNEL'});

    return send('interrupt')
      .then(() => dispatch({type: 'INTERRUPTED_KERNEL'}))
      .catch(error => dispatch(errorCaught(error)));
  };
}

export function isBusy() {
  return {type: 'KERNEL_IS_BUSY'};
}

export function isIdle() {
  return {type: 'KERNEL_IS_IDLE'};
}

export function kernelDetected(pythonOptions) {
  track('kernel','kernel_detected');
  // save over previous settings
  if (!pythonOptions.cmd) {
    throw new Error('Unacceptable python options without cmd that created it');
  }

  store.set('pythonOptions', pythonOptions);
  store.set('pythonCmd', pythonOptions.cmd);
  return {type: 'KERNEL_DETECTED', pythonOptions};
}

export function askForPythonOptions() {
  track('kernel','ask_for_python_options');
  return {type: 'ASK_FOR_PYTHON_OPTIONS'};
}

/**
 * Detect if the information we have about their kernel is good, and if it isn't,
 * try to auto-detect a working kernel
 * @returns {Function}
 */
export function detectKernel() {
  return function (dispatch) {
    const pythonCmd = store.get('pythonCmd');
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

export function restart() {
  return function (dispatch) {
    return client.restartInstance()
      .then(() => dispatch({type: 'KERNEL_RESTARTED'}))
      .catch(error => dispatch(errorCaught(error)));
  };
}

function detectKernelVariables() {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.find(state.terminals, {hasFocus: true}),
      id = terminal.id;

    return client.getVariables().then(function (variables) {
      return dispatch({type: 'VARIABLES_DETECTED', variables, id});
    }).catch(error => dispatch(errorCaught(error)));
  };
}

export function executeActiveFileInActiveConsole() {
  return function (dispatch, getState) {
    const state = getState(),
      items = _.head(state.editorTabGroups).items,
      focusedAce = state && _.find(items, {hasFocus: true}),
      el = focusedAce && document.querySelector('#' + focusedAce.id),
      aceInstance = el && ace.edit(el),
      filename = focusedAce.filename,
      focusedTerminal = state && _.find(state.terminals, {hasFocus: true}),
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


export default {
  askForPythonOptions,
  detectKernel,
  detectKernelVariables,
  executeActiveFileInActiveConsole,
  isBusy,
  isIdle,
  interrupt,
  kernelDetected,
  restart
};
