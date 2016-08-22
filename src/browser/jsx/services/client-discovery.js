/**
 * All functions that interact with the client api but do not require an active instance (no instanceId)
 *
 * For example, a function that tries to run python but then kills the instance immediately would go here.
 *
 * @module
 */

import _ from 'lodash';
import bluebird from 'bluebird';
import {send} from 'ipc';
import {local, session} from './store';
import guid from './guid';
import track from './track';

const pythonOptionsTimeout = 2 * 60 * 1000;

/**
 * @param {object} options
 * @param {string} options.cmd
 * @param {string} [options.cwd]
 * @returns {Promise}
 */
function checkKernel(options) {
  options = _.pick(options, ['cmd', 'cwd']);

  if (!options.cmd) {
    throw new Error('Missing cmd for checkKernel');
  }

  if (!options.cwd) {
    options.cwd = local.get('workingDirectory') || '~';
  }

  return bluebird.try(() => send('checkKernel', options));
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

  return bluebird.try(() => send('executeWithNewKernel', options, text));
}

function getSystemFacts() {
  let systemFacts = local.get('systemFacts');

  if (!systemFacts || !systemFacts.appVersion) {
    return send('getSystemFacts').then(function (facts) {
      local.set('systemFacts', facts);
      return facts;
    });
  }

  return bluebird.resolve(systemFacts);
}

/**
 * This is fetched each time the app is restarted (uses sessionStorage, not localStorage)
 * @returns {Promise}
 */
function getAppVersion() {
  let systemFacts = session.get('appVersion');

  if (!systemFacts || !systemFacts.appVersion) {
    return send('getAppVersion').then(function (version) {
      local.set('appVersion', version);
      return version;
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
  return send('getSystemFacts').then(function (facts) {
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
  getAppVersion,
  getFreshPythonOptions,
  getSystemFacts,
  getUserId,
  executeWithNewKernel
};
