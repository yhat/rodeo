/**
 * Kernel events can be triggered from several different components that want to interact with the underlying kernel.
 * @module
 */

import _ from 'lodash';
import { send } from '../services/ipc';
import * as store from '../services/store';
import systemFacts from '../services/system-facts';
import client from '../services/client';
import clientDiscovery from '../services/client-discovery';
import {errorCaught} from './application';

export function interrupt() {
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
  // change executable to cmd
  pythonOptions.cmd = pythonOptions.cmd || pythonOptions.executable;
  delete pythonOptions.executable;

  // save over previous settings
  if (!pythonOptions.cmd) {
    debugger;
    throw new Error('WOAH!');
  }

  store.set('pythonOptions', pythonOptions);
  store.set('pythonCmd', pythonOptions.cmd);
  return {type: 'KERNEL_DETECTED', pythonOptions};
}

export function askForPythonOptions() {
  return {type: 'ASK_FOR_PYTHON_OPTIONS'};
}

/**
 * Detect if the information we have about their kernel is good, and if it isn't,
 * try to auto-detect a working kernel
 * @returns {Function}
 */
export function detectKernel() {
  return function (dispatch) {
    const pythonOptions = store.get('pythonOptions');
    let promise;

    if (pythonOptions) {
      // verify anyway
      promise = clientDiscovery.checkKernel(pythonOptions)
        .catch(() => systemFacts.getFreshPythonOptions());
    } else {
      // get them
      promise = systemFacts.getFreshPythonOptions();
    }

    return promise
      .then(pythonOptions => dispatch(kernelDetected(pythonOptions)))
      .catch(() => dispatch(askForPythonOptions()));
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

export default {
  askForPythonOptions,
  detectKernel,
  detectKernelVariables,
  isBusy,
  isIdle,
  interrupt,
  kernelDetected,
  restart
};
