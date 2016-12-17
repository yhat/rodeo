import _ from 'lodash';
import bluebird from 'bluebird';
import responseService from './response';
import pythonLanguage from './python-language';
import {local} from '../store';
import api from '../api';
import clientDiscovery from './client-discovery';

let instancePromise;

function getPythonCmd() {
  if (clientDiscovery.shouldUseBuiltinPython()) {
    return '<rodeo-builtin-miniconda>';
  }

  return local.get('pythonCmd') || 'python';
}

function getInstance() {
  return instancePromise || bluebird.resolve(null);
}

function setInstance(instance) {
  instancePromise = bluebird.resolve(instance);
}

/**
 * @returns {Promise}
 */
function createInstance() {
  // they should kill first if they want a new one
  if (instancePromise) {
    return instancePromise;
  }

  let cmd = getPythonCmd(),
    promise = clientDiscovery.getExternalOptions()
    .then(externalOptions => api.send('createKernelInstance', _.assign({cmd}, externalOptions)))
    .then(instanceId => ({instanceId}));

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
  return api.send('killKernelInstance', instance.instanceId).finally(function () {
    instancePromise = false;
  }).catch(_.noop);
}

/**
 * Kill an old client, and after it is gone, create a new one.
 * @param {{instanceId: string}} instance
 * @returns {Promise}
 */
function restartInstance(instance) {
  return killInstance(instance)
    .then(() => createInstance());
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
 * @param {string} code
 * @param {object} [args={}]
 * @param {boolean} [args.silent]
 * @param {boolean} [args.storeHistory]
 * @param {object} [args.userExpressions]
 * @param {boolean} [args.allowStdin]
 * @param {boolean} [args.stopOnError]
 * @returns {Promise}
 */
function invokeExecute(instance, code, args) {
  args = args || {};
  return invoke(instance, {
    method: 'execute',
    kwargs: _.assign({code}, pythonLanguage.toPythonArgs(args))
  });
}

function input(instance, text) {
  const startTime = new Date().getTime();

  return api.send('inputWithKernel', instance, text).then(function (result) {
    const name = 'input time',
      ms = (new Date().getTime() - startTime) + 'ms';

    if (ms > 250) {
      console.warn(name, ms);
    }

    return result;
  });
}

/**
 * @param {{instanceId: string}} instance
 * @param {string} code
 * @param {object} [args={}]
 * @param {boolean} [args.silent]
 * @param {boolean} [args.storeHistory]
 * @param {object} [args.userExpressions]
 * @param {boolean} [args.allowStdin]
 * @param {boolean} [args.stopOnError]
 * @returns {Promise}
 */
function execute(instance, code, args) {
  const startTime = new Date().getTime();

  args = args || {};
  return getResult(instance, {
    method: 'execute',
    kwargs: _.assign({code}, pythonLanguage.toPythonArgs(args))
  }, 'execute_reply').then(function (result) {
    const name = 'execution time',
      ms = (new Date().getTime() - startTime) + 'ms';

    if (ms > 250) {
      console.warn(name, ms);
    }

    return result;
  });
}

/**
 * Lighter-weight version of execution; new code should use this instead
 * @param {{instanceId: string}} instance
 * @param {object} params
 * @returns {Promise}
 */
function invoke(instance, params) {
  const startTime = new Date().getTime();

  return api.send('invokeWithKernel', instance, params).then(function (result) {
    const name = 'invocation time',
      ms = (new Date().getTime() - startTime) + 'ms';

    if (ms > 250) {
      console.warn('slow', name, ms);
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

  return api.send('executeHidden', instance, code, resolveEvent).then(function (result) {
    const name = 'execution time',
      ms = (new Date().getTime() - startTime) + 'ms';

    if (ms > 250) {
      console.warn('slow', name, ms);
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
  return api.send('getAutoComplete', instance, code, cursorPos);
}

/**
 * @param {{instanceId: string}} instance
 * @returns {Promise}
 */
function getStatus(instance) {
  return api.send('getStatus', instance);
}

/**
 * @param {{instanceId: string}} instance
 * @returns {Promise}
 */
function interrupt(instance) {
  return api.send('interrupt', instance);
}

/**
 * @param {{instanceId: string}} instance
 * @param {string} code
 * @param {number} cursorPos
 * @param {number} detailLevel  Either 0 or 1.
 * @returns {Promise}
 */
function getInspection(instance, code, cursorPos, detailLevel) {
  return api.send('getInspection', instance, code, cursorPos, detailLevel);
}

function isComplete(instance, code) {
  return api.send('isComplete', instance, code);
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
 * @param {{instanceId: string}} instance
 * @param {object} obj
 * @param {string} resolveEvent
 * @returns {Promise}
 */
function getResult(instance, obj, resolveEvent) {
  // invoke the command
  return invoke(instance, obj).then(function (id) {
    return new bluebird(function (resolve, reject) {
      // wait for the resolveEvent to occur
      responseService.addRequest(id, {resolveEvent, deferred: {resolve, reject}});
    });
  });
}

/**
 * Guarantee that an instance is created before we ever run anything.
 *
 * If it is ever deleted, guarantee a new one is created.
 */
export default _.assign({
  guaranteeInstance,
  dropInstance,
  setInstance,
  getInstance
}, _.mapValues({
  execute,
  executeHidden,
  isComplete,
  invoke,
  invokeExecute,
  input,
  interrupt,
  getInspection,
  getAutoComplete,
  getResult,
  getStatus,
  killInstance,
  restartInstance
}, prependPromiseFunction(guaranteeInstance)));
