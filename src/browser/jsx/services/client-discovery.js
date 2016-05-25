/**
 * All functions that interact with the client api but do not require an active instance (no instanceId)
 *
 * For example, a function that tries to run python but then kills the instance immediately would go here.
 *
 * @module
 */

import _ from 'lodash';
import {send} from './ipc';

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
  return send('getSystemFacts');
}

export default {
  checkKernel,
  getSystemFacts
};
