/**
 * Kernel events can be triggered from several different components that want to interact with the underlying kernel.
 * @module
 */

import _ from 'lodash';
import ace from 'ace';
import { send } from '../services/ipc';
import * as store from '../services/store';
import systemFacts from '../services/system-facts';
import client from '../services/client';
import clientDiscovery from '../services/client-discovery';

export function interrupt() {
  return function (dispatch) {
    dispatch({type: 'INTERRUPTING_KERNEL'});

    return send('interrupt')
      .then(() => dispatch({type: 'INTERRUPTED_KERNEL'}))
      .catch(error => console.error(error));
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
  pythonOptions.cmd = pythonOptions.executable;
  delete pythonOptions.executable;

  // save over previous settings
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

export function executeActiveFileInActiveConsole() {
  return function (dispatch, getState) {
    const state = getState(),
      focusedAce = state && _.find(state.acePanes, {hasFocus: true}),
      el = focusedAce && document.querySelector('#' + focusedAce.id),
      aceInstance = el && ace.edit(el),
      filename = focusedAce.filename,
      focusedTerminal = state && _.find(state.terminals, {hasFocus: true}),
      id = focusedTerminal.id,
      content = aceInstance && aceInstance.getSession().getValue();

    dispatch({type: 'EXECUTING', filename, id});

    return client.execute(content)
      .then(() => dispatch({type: 'EXECUTED', id}))
      .catch(error => console.error(error));
  };
}

export function execute(text, id) {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = state && _.find(state.terminals, {id});

    if (terminal) {
      dispatch({type: 'EXECUTING', text, id});

      return client.execute(text)
        .then(() => dispatch({type: 'EXECUTED', text, id}))
        .catch(error => console.error(error));
    } else {
      console.error(new Error('No terminal with id ' + id));
    }
  };
}

export default {
  askForPythonOptions,
  detectKernel,
  execute,
  executeActiveFileInActiveConsole,
  isBusy,
  isIdle,
  interrupt,
  kernelDetected
};
