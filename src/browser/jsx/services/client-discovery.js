/**
 * All functions that interact with the client api but do not require an active instance (no instanceId)
 *
 * For example, a function that tries to run python but then kills the instance immediately would go here.
 *
 * @module
 */

import _ from 'lodash';
import {send} from './ipc';
import store from './store';
import session from './session';
import guid from './guid';

/**
 * @param {object} options
 * @param {string} options.cmd
 * @param {string} [options.cwd]
 * @returns {Promise}
 */
function checkKernel(options) {
  options = _.pick(options, ['cmd', 'cwd']);

  return send('checkKernel', options);
}

function getSystemFacts() {
  let systemFacts = store.get('systemFacts');

  if (!systemFacts || !systemFacts.appVersion) {
    return send('getSystemFacts').then(function (facts) {
      store.set('systemFacts', facts);
      return facts;
    });
  }

  return Promise.resolve(systemFacts);
}

/**
 * This is fetched each time the app is restarted (uses sessionStorage, not localStorage)
 * @returns {Promise}
 */
function getAppVersion() {
  let systemFacts = session.get('appVersion');

  if (!systemFacts || !systemFacts.appVersion) {
    return send('getAppVersion').then(function (facts) {
      store.set('appVersion', facts);
      return facts;
    });
  }

  return Promise.resolve(systemFacts);
}

function getUserId() {
  let userId = store.get('userId');

  if (!userId) {
    userId = guid();
    store.set('userId', userId);
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

    store.set('systemFacts', facts);
    return checkKernel(pythonOptions)
      .then(() => pythonOptions);
  });
}

export default {
  checkKernel,
  getAppVersion,
  getFreshPythonOptions,
  getSystemFacts,
  getUserId
};
