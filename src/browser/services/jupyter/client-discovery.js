/**
 * All functions that interact with the client api but do not require an active instance (no instanceId)
 *
 * For example, a function that tries to run python but then kills the instance immediately would go here.
 *
 * @module
 */

import _ from 'lodash';
import api from '../api';
import bluebird from 'bluebird';
import env from '../env';
import {local, session} from '../store';
import guid from '../guid';
import track from '../track';

const pythonOptionsTimeout = 2 * 60 * 1000;

function shouldUseBuiltinPython() {
  const useBuiltinPython = local.get('useBuiltinPython') || 'failover',
    hasPythonFailedOver = session.get('hasPythonFailedOver') || false;

  return useBuiltinPython === 'yes' || (hasPythonFailedOver && useBuiltinPython === 'failover');
}

function getKernelName(kernelName) {
  if (kernelName) {
    return kernelName;
  }

  kernelName = local.get('kernelName');

  // if they don't know their kernel name, conda has a default if set to 'python3'
  if (!kernelName) {
    kernelName = 'python3';
    local.set('kernelName', kernelName);
  }

  return kernelName;
}

function getCurrentWorkingDirectory(cwd) {
  return cwd || local.get('workingDirectory') || '~';
}

function getExternalOptions(options) {
  options = options || {};
  return bluebird.props({
    cwd: getCurrentWorkingDirectory(options.cwd),
    kernelName: getKernelName(options.kernelName),
    env: env.getEnvironmentVariables(options.env)
  });
}

/**
 * @param {object} options
 * @returns {Promise}
 */
function checkKernel(options) {
  return getExternalOptions(options)
    .then(externalOptions => api.send('checkKernel', _.assign(options, externalOptions)));
}

/**
 * @param {object} options
 * @param {string} text
 * @returns {Promise}
 */
function executeWithNewKernel(options, text) {
  return getExternalOptions(options)
    .then(externalOptions => api.send('executeWithNewKernel', _.assign(options, externalOptions), text));
}

function getSystemFacts() {
  let systemFacts = local.get('systemFacts');

  if (!systemFacts) {
    return api.send('getSystemFacts').then(function (facts) {
      local.set('systemFacts', facts);
      return facts;
    });
  }

  return bluebird.resolve(systemFacts);
}

function getUserId() {
  let userId = local.get('userId');

  if (!userId) {
    userId = guid();
    local.set('userId', userId);
  }

  return userId;
}
/**
 * Get the first set of working kernel options that was detected when gathering system facts
 * (by the by, also refreshes the known system facts.)
 * @returns {Promise<object>}
 */
function getFreshPythonOptions() {
  return api.send('getSystemFacts').then(function (facts) {
    const availablePythonKernels = facts && facts.availablePythonKernels,
      head = _.head(availablePythonKernels),
      pythonOptions = head && head.pythonOptions;

    try {
      _.each(availablePythonKernels, function (kernel) {
        kernel = _.cloneDeep(kernel);
        if (kernel.checkResults) {
          delete kernel.checkResults.packages;
        }

        if (kernel.label || kernel.cmd) {
          track({category: 'client_discovery', action: 'available_python_kernel', label: kernel.label || kernel.cmd});
        }
      });
    } catch (ex) {
      // pass
    }

    local.set('systemFacts', facts);
    return checkKernel(pythonOptions)
      // add any extra information it came back with
      .then(checkedPythonOptions => _.defaults(pythonOptions, checkedPythonOptions))
      .timeout(pythonOptionsTimeout, 'Timed out getting new python options');
  });
}

export default {
  checkKernel,
  getExternalOptions,
  getFreshPythonOptions,
  getSystemFacts,
  getUserId: _.memoize(getUserId), // we can assume it'll remain the same for the lifetime of the app
  executeWithNewKernel,
  shouldUseBuiltinPython
};
