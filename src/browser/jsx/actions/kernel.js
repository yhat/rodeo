/**
 * Kernel events can be triggered from several different components that want to interact with the underlying kernel.
 * @module
 */

import _ from 'lodash';
import ace from 'ace';
import { send } from '../services/ipc';
import * as store from '../services/store';

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
  store.set('pythonOptions', pythonOptions);
  return {type: 'KERNEL_DETECTED', pythonOptions};
}

export function askForPythonOptions() {
  return {type: 'ASK_FOR_PYTHON_OPTIONS'};
}

/**
 * Get the first set of working kernel options that was detected when gathering system facts
 * (by the by, also refreshes the known system facts.)
 * @returns {Promise<object>}
 */
function getPythonOptionsFromSystemFacts() {
  return send('get_system_facts').then(function (facts) {
    const availablePythonKernels = facts && facts.availablePythonKernels,
      head = _.head(availablePythonKernels),
      pythonOptions = head && head.pythonOptions;

    store.set('systemFacts', facts);
    return send('check_kernel', pythonOptions).then(function () {
      return pythonOptions;
    });
  });
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
      promise = send('check_kernel', pythonOptions)
        .catch(() => getPythonOptionsFromSystemFacts());
    } else {
      // get them
      promise = getPythonOptionsFromSystemFacts();
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
      shell = focusedTerminal.shell,
      cmd = focusedTerminal.cmd,
      content = aceInstance && aceInstance.getSession().getValue();

    dispatch({type: 'EXECUTING', filename, id});

    return send('execute', content, {cmd, shell})
      .then(() => dispatch({type: 'EXECUTED', id}))
      .catch(error => console.error(error));
  };
}

export function execute(text, id) {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = state && _.find(state.terminals, {id}),
      shell =  terminal && terminal.shell,
      cmd = terminal && terminal.cmd;

    if (terminal) {
      dispatch({type: 'EXECUTING', text, id});

      return send('execute', text, {cmd, shell})
        .then(() => dispatch({type: 'EXECUTED', text, id}))
        .catch(error => console.error(error));
    } else {
      console.error(new Error('No terminal with id ' + id));
    }
  };
}

export default {
  execute,
  executeActiveFileInActiveConsole,
  isIdle,
  isBusy,
  interrupt,
  detectKernel
};
