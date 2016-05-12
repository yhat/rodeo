'use strict';

/**
 * @module
 * @see http://ipython.org/ipython-doc/stable/api/generated/IPython.kernel.client.html#IPython.kernel.client.KernelClient
 * @see http://jupyter-client.readthedocs.org/en/latest/messaging.html
 */

/**
 * @typedef {object} ZeroMQMessage
 * @property content
 * @property [content.execution_state]
 * @property header
 * @property footer
 */

/**
 * @typedef {object} JupyterClientResponse
 * @property {string} id
 * @property {ZeroMQMessage|string} result  Can be an id for a later response, or it can be an actual response.
 * @property {'stdin'|'iopub'|'shell'} source
 */



const _ = require('lodash'),
  bluebird = require('bluebird'),
  clientResponse = require('./client-response'),
  EventEmitter = require('events'),
  StreamSplitter = require('stream-splitter'),
  log = require('../../services/log').asInternal(__filename),
  path = require('path'),
  processes = require('../../services/processes'),
  promises = require('../../services/promises'),
  pythonLanguage = require('./language'),
  uuid = require('uuid');

function createObjectEmitter(stream) {
  const streamSplitter = new StreamSplitter('\n'),
    emitter = new EventEmitter();

  stream = stream.pipe(streamSplitter);
  stream.encoding = 'utf8';
  stream.on('token', function (token) {
    let obj;

    try {
      obj = JSON.parse(token);
      emitter.emit('data', obj);
    } catch (ex) {
      log('error', require('util').inspect(token), ex);
      // we don't have enough data yet, maybe?
    }
  });
  stream.on('error', error => emitter.emit('error', error) );

  return emitter;
}

/**
 * @param {JupyterClient} client
 * @param {string} source
 * @param {object} data
 */
function handleProcessStreamEvent(client, source, data) {
  log('error', source, data);
  client.emit('event', source, data);
}

/**
 * @param {JupyterClient} client
 * @param {ChildProcess} child
 */
function listenToChild(client, child) {
  const objectEmitter = createObjectEmitter(child.stdout);

  objectEmitter.on('data', _.partial(clientResponse.handle, client));
  objectEmitter.on('error', _.partial(handleProcessStreamEvent, client, 'objectEmitter.error'));
  objectEmitter.on('end', _.partial(handleProcessStreamEvent, client, 'objectEmitter.end'));

  child.stdout.on('error', _.partial(handleProcessStreamEvent, client, 'stdout.error'));
  child.stderr.on('data', _.partial(handleProcessStreamEvent, client, 'stderr.data'));
  child.stderr.on('error', _.partial(handleProcessStreamEvent, client, 'stderr.error'));

  child.on('error', _.partial(handleProcessStreamEvent, client, 'error'));
}

/**
 * Write object to script.
 * @param {ChildProcess} childProcess
 * @param {object} obj
 * @returns {Promise}
 */
function write(childProcess, obj) {
  return new bluebird(function (resolve, reject) {
    let result = childProcess.stdin.write(JSON.stringify(obj) + '\n', function (error) {
      if (!result) {
        reject(new Error('Unable to write to stdin'));
      } else if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * @param {JupyterClient} client
 * @param {object} invocation
 * @param {string} invocation.method
 * @param {Array} [invocation.args]
 * @param {object} [invocation.kwargs]
 * @param {string} [invocation.target]
 * @param {object} options
 * @param {string|string[]} options.successEvent
 * @returns {Promise}
 */
function request(client, invocation, options) {
  const childProcess = client.childProcess,
    requestMap = client.requestMap,
    id = uuid.v4().toString(),
    inputPromise = write(childProcess, _.assign({id}, invocation)),
    deferred = new bluebird.defer(),
    request = {
      id: id,
      deferred: deferred,
      successEvent: options.successEvent
    };

  request.deferred = deferred;
  requestMap[id] = request;

  return inputPromise.then(function () {
    return deferred.promise;
  }).finally(function () {
    // clean up reference, no matter what the result
    delete requestMap[id];
  });
}

/**
 * @class JupyterClient
 */
class JupyterClient extends EventEmitter {
  constructor(child) {
    super();
    this.childProcess = child;
    this.requestMap = {};

    listenToChild(this, child);
  }

  /**
   * @param {string} code
   * @param {object} [args]
   * @param {boolean} [args.silent]
   * @param {boolean} [args.storeHistory]
   * @param {object} [args.userExpressions]
   * @param {boolean} [args.allowStdin]
   * @param {boolean} [args.stopOnError]
   * @returns {Promise<object>}
   */
  execute(code, args) {
    return request(this, {
      method: 'execute',
      kwargs: _.assign({code}, pythonLanguage.toPythonArgs(args))
    }, {successEvent: 'execute_reply'});
  }

  /**
   * Respond to a request for input from the kernel
   * @param {string} str
   * @returns {Promise}
   */
  input(str) {
    return request(this, {method: 'input', args: [str]}, {successEvent: 'execute_reply'});
  }

  /**
   * @param {string} code
   * @param {object} [args]
   * @param {boolean} [args.silent]
   * @param {boolean} [args.storeHistory]
   * @param {object} [args.userExpressions]
   * @param {boolean} [args.allowStdin]
   * @param {boolean} [args.stopOnError]
   * @returns {Promise<object>}
   */
  getResult(code, args) {
    return request(this, {
      method: 'execute',
      kwargs: _.assign({code}, pythonLanguage.toPythonArgs(args))
    }, {successEvent: ['execute_results', 'display_data', 'stream']});
  }

  /**
   * @typedef {object} JupyterAutoCompletionMessage
   * @property {'ok'|'error'} status
   * @property {Array} matches
   * @property {number} cursorStart
   * @property {number} cursorEnd
   * @property {object} metadata
   */

  /**
   *
   *
   * We send msg_type: complete_request
   * We get msg_type: complete_reply with content of
   *   {status: ok|error, matches: Array, cursorStart: number, cursorEnd: number, metadata: map}
   * @param {string} code
   * @param {number} cursorPos
   * @returns {Promise<JupyterAutoCompletionMessage>}
   */
  getAutocomplete(code, cursorPos) {
    return request(this, {
      method: 'complete', // sends complete_request
      args: [code, cursorPos]
    }, {successEvent: 'complete_reply'});
  }

  /**
   * @typedef {object} JupyterInspectionMessage
   * @property {'ok'|'error'} status
   * @property {bool} found
   * @property {object} data
   * @property {object} metadata
   */

  /**
   * @param {string} code
   * @param {number} cursorPos
   * @param {number} [detailLevel=0]  Equivalent in python would be 0 is x?, 1 is x??
   * @returns {Promise<JupyterInspectionMessage>}
   */
  getInspection(code, cursorPos, detailLevel) {
    detailLevel = detailLevel || 0;

    return request(this, {
      method: 'inspect', // sends inspect_request
      args: [code, cursorPos, detailLevel]
    }, {successEvent: 'inspect_reply'});
  }

  /**
   * @typedef {object} JupyterCodeIsCompleteMessage
   * @property {'complete'|'incomplete'|'invalid'|'unknown'} status
   * @property {string} indent  Only for incomplete status
   */

  /**
   * Is code likely to run successfully?
   *
   * @param {string} code
   * @returns {Promise<JupyterCodeIsCompleteMessage>}
   */
  isComplete(code) {
    return request(this, {
      method: 'is_complete', // sends is_complete_request
      args: [code]
    }, {successEvent: 'is_complete_reply'});
  }

  /**
   * @returns {Promise}
   */
  kill() {
    return processes.kill(this.childProcess);
  }
}

/**
 * @param {object} [options]
 * @returns {object}
 */
function getPythonCommandOptions(options) {
  return _.assign({
    env: pythonLanguage.setDefaultEnvVars(process.env),
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'UTF8'
  }, _.pick(options || {}, ['shell']));
}

/**
 * @param {string} targetFile
 * @param {object} [options]
 * @param {string} [options.shell=<default for OS>]
 * @param {string} [options.cmd="python"]
 * @returns {ChildProcess}
 */
function createPythonScriptProcess(targetFile, options) {
  options = _.pick(options || {}, ['shell', 'cmd']);

  const processOptions = getPythonCommandOptions(options),
    cmd = options.cmd || 'python';

  return processes.create(cmd, [targetFile], processOptions);
}

/**
 * @param {object} options
 * @returns {Promise<JupyterClient>}
 */
function create(options) {
  const targetFile = path.resolve(path.join(__dirname, 'start_kernel.py'));

  return bluebird.try(function () {
    const child = createPythonScriptProcess(targetFile, options),
      client = new JupyterClient(child);

    return promises.eventsToPromise(client, {resolve: 'ready', reject: 'error'})
      .then(_.constant(client));
  });
}

/**
 * Runs a script in python, returns the output with errors and stderr rejecting the results
 * @param {string} targetFile
 * @param {object} [options]
 * @returns {Promise}
 */
function getPythonScriptResults(targetFile, options) {
  const processOptions = getPythonCommandOptions(options),
    cmd = options.cmd || 'python';

  return processes.run(cmd, [targetFile], processOptions);
}

/**
 * @param {object} options
 * @returns {Promise}
 */
function checkPython(options) {
  const targetFile = path.resolve(path.join(__dirname, 'check_python.py'));

  return exports.getPythonScriptResults(targetFile, options).then(JSON.parse);
}

module.exports.create = create;
module.exports.getPythonScriptResults = getPythonScriptResults;
module.exports.checkPython = checkPython;
