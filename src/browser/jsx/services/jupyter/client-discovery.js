/**
 * All functions that interact with the client api but do not require an active instance (no instanceId)
 *
 * For example, a function that tries to run python but then kills the instance immediately would go here.
 *
 * @module
 */

import _ from 'lodash';
import bluebird from 'bluebird';
import api from '../api';
import {local} from '../store';
import guid from '../guid';
import track from '../track';

const pythonOptionsTimeout = 2 * 60 * 1000;

function getEnvironmentVariables(env) {
  if (env) {
    return bluebird.resolve(env);
  }

  env = local.get('environmentVariables');

  if (env) {
    return bluebird.resolve(env);
  }

  return api.send('getEnvironmentVariables');
}

/**
 * @param {object} options
 * @param {string} options.cmd
 * @param {string} [options.cwd]
 * @returns {Promise}
 */
function checkKernel(options) {
  let cmd = options.cmd,
    cwd = options.cwd;

  if (!cmd) {
    throw new Error('Missing cmd for checkKernel');
  }

  if (!cwd) {
    cwd = local.get('workingDirectory') || '~';
  }

  return getEnvironmentVariables(options.env).then(env => api.send('checkKernel', {cmd, cwd, env}));
}

/**
 * @param {object} options
 * @param {string} options.cmd
 * @param {string} [options.cwd]
 * @param {string} text
 * @returns {Promise}
 */
function executeWithNewKernel(options, text) {
  if (!options.cwd) {
    options.cwd = '~';
  }

  return getEnvironmentVariables()
    .then(env => api.send('executeWithNewKernel', _.assign({env}, options), text));
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
  getEnvironmentVariables,
  getFreshPythonOptions,
  getSystemFacts,
  getUserId: _.memoize(getUserId), // we can assume it'll remain the same for the lifetime of the app
  executeWithNewKernel
};
