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
  assert = require('../../services/assert'),
  bluebird = require('bluebird'),
  clientResponse = require('./client-response'),
  EventEmitter = require('events'),
  environment = require('../../services/env'),
  StreamSplitter = require('stream-splitter'),
  log = require('../../services/log').asInternal(__filename),
  path = require('path'),
  files = require('../../services/files'),
  processes = require('../../services/processes'),
  pythonLanguage = require('./language'),
  uuid = require('uuid'),
  checkPythonPath = path.resolve(path.join(__dirname, 'check_python.py')),
  clone = require('../../services/clone'),
  ProcessError = require('../../services/errors/process-error'),
  assertValidOptions = assert(
    [{cmd: _.isString}, 'must have command'],
    [{cwd: _.isString}, 'must have working directory']
  ),
  second = 1000,
  timeouts = {
    checkTimeout: 120 * second,
    execTimeout: 120 * second
  };

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
  stream.on('error', error => emitter.emit('error', error));

  return emitter;
}

/**
 * @param {JupyterClient} client
 * @param {string} source
 * @param {object} data
 */
function handleProcessStreamEvent(client, source, data) {
  client.emit('event', source, data);
}

/**
 * @param {JupyterClient} client
 * @param {Error} error
 */
function handleProcessError(client, error) {
  client.emit('error', error);
}

/**
 * @param {JupyterClient} client
 * @param {number} code
 * @param {string} signal
 */
function handleProcessClose(client, code, signal) {
  client.emit('close', code, signal);
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

  child.on('error', _.partial(handleProcessError, client));
  child.on('close', _.partial(handleProcessClose, client));
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
 * @param {string|string[]} options.resolveEvent
 * @returns {Promise}
 */
function request(client, invocation, options) {
  const childProcess = client.childProcess,
    requestMap = client.requestMap,
    id = uuid.v4().toString(),
    inputPromise = write(childProcess, _.assign({id}, invocation)),
    resolveEvent = options.resolveEvent,
    hidden = options.hidden,
    startTime = new Date().getTime(),
    outputPromise = new Promise(function (resolve, reject) {
      requestMap[id] = {id, invocation, resolveEvent, hidden, deferred: {resolve, reject}};
    });

  return inputPromise
    .then(() => outputPromise)
    .finally(function () {
      const endTime = (new Date().getTime() - startTime) + 'ms',
        timeoutTime = endTime - 60000 * 10, // ten minutes
        maxSize = 50;
      let currentSize = _.size(requestMap);

      // clean up reference, no matter what the result
      for (let key in requestMap) {
        if (requestMap.hasOwnProperty(key)) {
          if (currentSize > maxSize) {
            delete requestMap[key];
            currentSize--;
          } else {
            const oldTime = parseInt(key, 10);

            if (oldTime < timeoutTime) {
              const wasRemoved = clientResponse.removeOutputEntry(requestMap[key].msg_id);

              log('log', {wasRemoved});

              delete requestMap[key];
              currentSize--;
            }
          }
        }
      }
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
    }, {resolveEvent: 'execute_reply'});
  }

  /**
   * Respond to a request for input from the kernel
   * @param {string} str
   * @returns {Promise}
   */
  input(str) {
    return request(this, {method: 'input', args: [str]}, {resolveEvent: 'execute_reply'});
  }

  interrupt() {
    const id = uuid.v4().toString(),
      target = 'manager',
      method = 'interrupt_kernel';

    return write(this.childProcess, {method, target, id});
  }

  invoke(params) {
    return request(this, params, {resolveEvent: 'link'});
  }

  /**
   * @param {string} str
   * @returns {Promise}
   */
  getEval(str) {
    return request(this, {
      exec_eval: str
    }, {resolveEvent: ['eval_results']});
  }

  /**
   * @param {string} code
   * @param {string|[string]} resolveEvent
   * @returns {Promise}
   */
  executeHidden(code, resolveEvent) {
    const args = {
      allowStdin: false,
      stopOnError: true
    };

    return request(this, {
      method: 'execute',
      kwargs: _.assign({code}, pythonLanguage.toPythonArgs(args))
    }, {
      resolveEvent,
      hidden: true
    });
  }

  getStatus() {
    const code = '__rodeo_print_status(globals())',
      args = {
        allowStdin: false,
        stopOnError: true
      };

    return request(this, {
      method: 'execute',
      kwargs: _.assign({code}, pythonLanguage.toPythonArgs(args))
    }, {
      resolveEvent: 'stream',
      hidden: true
    }).then(function (result) {
      return JSON.parse(result.text);
    });
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
  getAutoComplete(code, cursorPos) {
    return request(this, {
      method: 'complete', // sends complete_request
      args: [code, cursorPos]
    }, {resolveEvent: 'complete_reply', hidden: true});
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
    }, {resolveEvent: 'inspect_reply'});
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
    }, {resolveEvent: 'is_complete_reply', hidden: true});
  }

  /**
   * Safely request that the kernel end
   * @returns {Promise}
   */
  shutdown() {
    return request(this, {
      method: 'shutdown' // sends is_complete_request
    }, {resolveEvent: 'shutdown_reply'});
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
  return environment.getEnv().then(function (defaultEnv) {
    return _.assign({
      env: pythonLanguage.setDefaultEnvVars(defaultEnv),
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'UTF8'
    }, _.pick(options, ['cwd', 'shell']));
  });
}

/**
 * @param {string} targetFile
 * @param {object} [options]
 * @param {string} [options.shell=<default for OS>]
 * @param {string} [options.cmd="python"]
 * @returns {Promise<ChildProcess>}
 */
function createPythonScriptProcess(targetFile, options) {
  options = _.pick(options || {}, ['shell', 'cmd', 'cwd']);
  options = resolveHomeDirectoryOptions(options);

  return getPythonCommandOptions(options).then(function (processOptions) {
    const cmd = options.cmd || 'python';

    if (options.cwd) {
      processOptions.cwd = options.cwd;
    }

    return processes.create(cmd, [targetFile], processOptions);
  });
}

/**
 * @param {object} options
 * @returns {Promise<JupyterClient>}
 */
function create(options) {
  assertValidOptions(options);
  const targetFile = path.resolve(path.join(__dirname, 'start_kernel.py'));

  return createPythonScriptProcess(targetFile, options).then(function (child) {
    return new JupyterClient(child);
  });
}

/**
 * Runs a script in python, returns the output with errors and stderr rejecting the results
 * @param {string} targetFile
 * @param {object} [options]
 * @returns {Promise}
 */
function getPythonScriptResults(targetFile, options) {
  options = resolveHomeDirectoryOptions(options);

  return getPythonCommandOptions(options).then(function (processOptions) {
    return processes.exec(options.cmd, [targetFile], processOptions);
  });
}

/**
 * Try to parse json.  Trim to be within outer { or {.
 *
 * If fails, try again starting from the next { or [.  Repeat.
 *
 * Assumes the JSON, when found, will continue to the end.
 *
 * @param {string} str
 * @returns {object}
 */
function seekJson(str) {
  let result, match;

  // trim the front and back of the text to the brackets
  match = /(\{.*\}|\[.*\])/m.exec(str);
  if (!match) {
    return null;
  }

  str = match[0];
  while (!result && str.length) {
    try {
      result = JSON.parse(str);
    } catch (ex) {
      let firstBound;

      // move slightly ahead
      str = str.substr(1);

      // find the next { or [
      firstBound = Math.min(str.indexOf('{'), str.indexOf('['));
      if (firstBound === -1) {
        str = '';
      } else {
        str = str.substr(firstBound);
      }
    }
  }

  return result;
}

/**
 * @param {object} options
 * @returns {Promise}
 */
function check(options) {
  const timeout = timeouts.checkTimeout;

  assertValidOptions(options);

  options = resolveHomeDirectoryOptions(options);

  return getPythonScriptResults(checkPythonPath, options)
    .catch(function (error) {
      return {errors: [error], stdout: '', stderr: ''};
    })
    .timeout(timeout, 'Timed out when checking python with ' + JSON.stringify(options))
    .then(function (results) {
      results = _.cloneDeep(results);

      _.assign(results, options);
      _.assign(results, seekJson(results.stdout));

      return results;
    });
}

/**
 * @param {object} options
 * @param {string} [options.cwd]
 * @param {string} [options.cmd]
 * @returns {object}  Modified options
 */
function resolveHomeDirectoryOptions(options) {
  if (options) {
    options = _.clone(options);

    if (options.cmd) {
      options.cmd = files.resolveHomeDirectory(options.cmd);
    }

    if (options.cwd) {
      options.cwd = files.resolveHomeDirectory(options.cwd);
    }
  }

  return options;
}

function normalizeExecutionResult(result) {
  // convert errors to objects so they can travel across ipc
  result.errors = _.map(result.errors, error => clone.toObject(error));

  // to strings that will make sense on the outside
  result.stderr = result.stderr.join('\n');
  result.stdout = result.stdout.join('\n');

  return result;
}

function listenTo(jupyterClient, source, events) {
  jupyterClient.on(source, data => events.push({timestamp: new Date().getTime(), source, data}));
}

function addSourceData(result) {
  return function (source, data) {
    if (_.isBuffer(data)) {
      data = data.toString();
    }

    switch (source) {
      case 'stderr.data':
        result.stderr.push(data);
        break;
      case 'stdout.data':
        result.stdout.push(data);
        break;
      default:
        break;
    }
  };
}

/**
 * @param {object} options
 * @param {string} text
 * @returns {Promise}
 */
function exec(options, text) {
  const result = {
      errors: [],
      events: [],
      stderr: [],
      stdout: []
    },
    timeout = timeouts.execTimeout;

  return bluebird.try(function () {
    assertValidOptions(options);
    options = resolveHomeDirectoryOptions(options);

    return create(options).then(function (jupyterClient) {
      return new bluebird(function (resolve, reject, onCancel) {
        onCancel(function () {
          // kill process
          log('info', 'exec', 'cancelling process');
          try {
            jupyterClient.removeAllListeners();
            jupyterClient.kill()
              .then(() => log('info', 'exec', 'cancelled process'))
              .catch(error => log('error', 'failed to cancel process', error));
          } catch (ex) {
            log('error', 'error cancelling process', ex);
          }
        });

        jupyterClient.on('ready', function () {
          jupyterClient.execute(text)
          // graceful shutdown, if possible
            .then(() => jupyterClient.shutdown())
            .timeout(timeout, new ProcessError('Timed out when executing python', {options, result}))
            .catch(function (error) {
              result.errors.push(error);
              return jupyterClient.kill();
            });
        });
        jupyterClient.on('event', addSourceData(result));
        jupyterClient.on('error', error => result.errors.push(error));
        jupyterClient.on('close', (code, signal) => { resolve(_.assign({code, signal}, result)); });

        listenTo(jupyterClient, 'shell', result.events);
        listenTo(jupyterClient, 'iopub', result.events);
        listenTo(jupyterClient, 'stdin', result.events);
        listenTo(jupyterClient, 'input_request', result.events);
      }).timeout(timeout, new ProcessError('Timed out waiting for Jupyter to start', {options, result}));
    });
  }).catch(function (error) {
    log('error', 'exec error', error);
    result.errors.push(error);

    return _.assign(result, options);
  }).then(normalizeExecutionResult);
}

module.exports.create = create;
module.exports.exec = exec;
module.exports.getPythonScriptResults = getPythonScriptResults;
module.exports.check = check;
