import _ from 'lodash';
import bluebird from 'bluebird';
import {local} from './store';
import {send} from 'ipc';

let instancePromise;

/**
 * @returns {Promise}
 */
function createInstance() {
  // they should kill first if they want a new one
  if (instancePromise) {
    return instancePromise;
  }

  let promise,
    cmd = local.get('pythonCmd') || 'python',
    cwd = local.get('workingDirectory') || '~';

  promise = send('createKernelInstance', {cmd, cwd}).then(function (instanceId) {
    return {instanceId};
  });

  // save results as immutable promise
  instancePromise = promise;

  return promise;
}

/**
 * Guarantee that there is an instance ready to run commands.
 * This is run before every active function call
 * @returns {Promise}
 */
function guaranteeInstance() {
  return bluebird.try(function () {
    if (!instancePromise) {
      instancePromise = createInstance();
    }

    return instancePromise;
  });
}

/**
 * Just kill the current instance but do not recreate it yet.
 * @param {{instanceId: string}} instance
 * @returns {*}
 */
function killInstance(instance) {
  console.log(__filename, 'killInstance');
  return send('killKernelInstance', instance.instanceId).then(function () {
    instancePromise = false;
  });
}

/**
 * Kill an old client, and after it is gone, create a new one.
 * @param {{instanceId: string}} instance
 * @returns {Promise}
 */
function restartInstance(instance) {
  console.log(__filename, 'restartInstance');
  return send('killKernelInstance', instance.instanceId).then(function () {
    instancePromise = false;
    return createInstance();
  });
}

/**
 * Used when a client disappears, and we need to create a new one.
 * @returns {Promise}
 */
function dropInstance() {
  instancePromise = false;
  return bluebird.resolve();
}

/**
 * @param {{instanceId: string}} instance
 * @param {string} content
 * @returns {Promise}
 */
function execute(instance, content) {
  const startTime = new Date().getTime();

  return send('executeWithKernel', instance, content).then(function (result) {
    const name = 'execution time',
      ms = (new Date().getTime() - startTime) + 'ms';

    if (ms > 250) {
      console.warn(name, ms);
    } else {
      console.log(name, ms);
    }

    return result;
  });
}

/**
 * Execute a hidden command (not shown to the user)
 * @param {{instanceId: string}} instance
 * @param {string} code
 * @param {string} resolveEvent
 * @returns {Promise}
 */
function executeHidden(instance, code, resolveEvent) {
  const startTime = new Date().getTime();

  return send('executeHidden', instance, code, resolveEvent).then(function (result) {
    const name = 'execution time',
      ms = (new Date().getTime() - startTime) + 'ms';

    if (ms > 250) {
      console.warn(name, ms);
    } else {
      console.log(name, ms);
    }

    return result;
  });
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
function getStatus(instance) {
  return send('getStatus', instance);
}

/**
 * @param {{instanceId: string}} instance
 * @returns {Promise}
 */
function interrupt(instance) {
  return send('interrupt', instance);
}

/**
 * @param {{instanceId: string}} instance
 * @param {string} code
 * @param {number} cursorPos
 * @param {number} detailLevel  Either 0 or 1.
 * @returns {Promise}
 */
function getInspection(instance, code, cursorPos, detailLevel) {
  return send('getInspection', instance, code, cursorPos, detailLevel);
}

/**
 * Run the prepended function before the original function.
 * @param {function} prependedFn
 * @returns {function}
 */
function prependPromiseFunction(prependedFn) {
  return function (originalFn) {
    return function () {
      let args = _.toArray(arguments);

      return bluebird.try(function () {
        return prependedFn().then(function (instance) {
          args.unshift(instance);
          return originalFn.apply(null, args);
        });
      });
    };
  };
}

/**
 * Guarantee that an instance is created before we ever run anything.
 *
 * If it is ever deleted, guarantee a new one is created.
 */
export default _.assign({
  guaranteeInstance,
  dropInstance
}, _.mapValues({
  execute,
  executeHidden,
  interrupt,
  getInspection,
  getAutoComplete,
  getStatus,
  killInstance,
  restartInstance
}, prependPromiseFunction(guaranteeInstance)));
