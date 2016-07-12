import _ from 'lodash';
import bluebird from 'bluebird';
import store from './store';
import {send} from 'ipc';

let instancePromise;

/**
 * @param {object} options
 * @param {string} options.cmd  The command to start python
 * @param {string} [options.cwd]  Optional working directory to start in for this instance
 * @returns {Promise}
 */
function createInstance(options) {
  let promise,
    cmd = store.get('pythonCmd'),
    cwd = store.get('workingDirectory'),
    pythonOptions = store.get('pythonOptions');

  options = _.defaults(options || {}, {cmd, cwd}, pythonOptions);

  options = _.pickBy(_.pick(options, ['cmd', 'cwd']), _.identity);

  if (!options.cmd) {
    throw new Error('Cannot create python instance, missing cmd');
  }

  // they should kill first if they want a new one
  if (instancePromise) {
    return instancePromise;
  }

  promise = send('createKernelInstance', options).then(function (instanceId) {
    return {instanceId};
  });

  // save results as immutable promise
  instancePromise = promise;

  return promise;
}

/**
 * This is run before every active function call
 * @returns {Promise}
 */
function guaranteeInstance() {
  if (!instancePromise) {
    instancePromise = createInstance();
  }

  return instancePromise;
}

function killInstance(instance) {
  return send('killKernelInstance', instance.instanceId).then(function () {
    instancePromise = false;
  });
}

function restartInstance(instance) {
  return send('killKernelInstance', instance.instanceId).then(function () {
    instancePromise = false;
    return createInstance();
  });
}

/**
 * @param {{instanceId: string}} instance
 * @param {string} content
 * @returns {Promise}
 */
function execute(instance, content) {
  const startTime = new Date().getTime();

  return send('execute', instance, content).then(function (result) {
    const ms = (new Date().getTime() - startTime);

    if (ms > 250) {
      console.warn('execution time', (new Date().getTime() - startTime) + 'ms');
    } else {
      console.log('execution time', (new Date().getTime() - startTime) + 'ms');
    }
    return result;
  });
}

function executeHidden(instance, code, successEvent) {
  const startTime = new Date().getTime();

  return send('executeHidden', instance, code, successEvent).then(function (result) {
    const ms = (new Date().getTime() - startTime);

    if (ms > 250) {
      console.warn('execution time', (new Date().getTime() - startTime) + 'ms');
    } else {
      console.log('execution time', (new Date().getTime() - startTime) + 'ms');
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
function getVariables(instance) {
  return send('getVariables', instance);
}

/**
 * @param {{instanceId: string}} instance
 * @returns {Promise}
 */
function interrupt(instance) {
  return send('interrupt', instance);
}

/**
 * Guarantee that an instance is created before we ever run anything.
 *
 * If it is ever deleted, guarantee a new one is created.
 */
export default _.mapValues({
  execute,
  executeHidden,
  interrupt,
  getAutoComplete,
  getVariables,
  killInstance,
  restartInstance
}, function (fn) {
  return function () {
    let args = _.toArray(arguments);

    return bluebird.try(function () {
      return guaranteeInstance().then(function (instance) {
        args.unshift(instance);
        return fn.apply(null, args);
      });
    });
  };
});
