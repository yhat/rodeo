import _ from 'lodash';
import store from './store';
import {send} from './ipc';

let instancePromise;

/**
 * @param {object} options
 * @param {string} options.cmd  The command to start python
 * @param {string} [options.cwd]  Optional working directory to start in for this instance
 * @returns {Promise}
 */
function createInstance(options) {
  options = options || store.get('pythonOptions');
  options = _.pick(options, ['cmd', 'cwd']);

  return send('createKernelInstance', options).then(function (instanceId) {
    return {instanceId};
  });
}

function killInstance(instance) {
  return send('killKernelInstance', instance.instanceId).then(function () {
    instancePromise = false;
  });
}

/**
 * @param {{instanceId: string}} instance
 * @param {string} content
 * @returns {Promise}
 */
function execute(instance, content) {
  return send('execute', instance, content);
}

/**
 * @param {{instanceId: string}} instance
 * @param {string} code
 * @param {number} cursorPos
 * @returns {Promise}
 */
function getAutoComplete(instance, code, cursorPos) {
  return send('getAutoComplete', instance, code, cursorPos);
}

/**
 * @param {{instanceId: string}} instance
 * @returns {Promise}
 */
function getVariables(instance) {
  return send('getVariables', instance);
}

/**
 * This is run before every active function call
 * @returns {Promise}
 */
function guaranteeInstance() {
  if (!instancePromise) {
    instancePromise = createInstance(store.get('pythonOptions'));
  }

  return instancePromise;
}

/**
 * Guarantee that an instance is created before we ever run anything.
 *
 * If it is ever deleted, guarantee a new one is created.
 */
export default _.mapValues({
  execute,
  getAutoComplete,
  getVariables,
  killInstance
}, function (fn) {
  return function () {
    let args = _.toArray(arguments);

    return guaranteeInstance().then(function (instance) {
      args.unshift(instance);
      return fn.apply(null, args);
    });
  };
});
