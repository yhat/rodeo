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
    const cmd = local.get('pythonCmd');
    let promise;

    if (cmd) {
      // verify anyway
      promise = clientDiscovery.checkKernel({cmd})
        .then(function (result) {
          const isMissingCmd = !result.cmd,
            hasErrors = result.errors && result.errors.length > 0,
            isMissingJupter = !result.hasJupyterKernel;

          console.log('HEY', result);

          if (isMissingCmd || hasErrors || isMissingJupter) {
            result = clientDiscovery.getFreshPythonOptions();
          }

          return result;
        })
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
  return function (dispatch) {
    return client.getStatus().then(function (status) {
      const variables = status.variables,
        cwd = status.cwd;

      dispatch({type: 'VARIABLES_CHANGED', variables});
      dispatch({type: 'WORKING_DIRECTORY_CHANGED', cwd});

      return status;
    }).catch(error => dispatch(errorCaught(error)));
  };
}

function execute(text) {
  return function () {
    return client.execute(text);
  };
}

export default {
  askForPythonOptions,
  detectKernel,
  detectKernelVariables,
  execute,
  isBusy,
  isIdle,
  interrupt,
  kernelDetected,
  restart
};
