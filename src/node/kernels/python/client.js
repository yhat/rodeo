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

import _ from 'lodash';
import assert from '../../services/assert';
import bluebird from 'bluebird';
import clientResponse from './client-response';
import cuid from 'cuid/dist/node-cuid';
import errorClone from '../../services/clone';
import EventEmitter from 'events';
import files from '../../services/files';
import fs from 'fs';
import listenScript from './listen.py';
import patch from './patch.py';
import path from 'path';
import processes from '../../services/processes';
import ProcessError from '../../services/errors/process-error';
import pythonLanguage from './language';
import StreamSplitter from 'stream-splitter';
import checkScript from './check.py';

const log = require('../../services/log').asInternal(__filename),
  assertValidOptions = assert(
    [{cmd: _.isString}, 'must have command'],
    [{cwd: _.isString}, 'must have working directory'],
    [{env: _.isObject}, 'must have environment'],
    [{kernelName: _.isString}, 'must have kernelName']
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

function isMissingRodeoDependency(client, data) {
  const match = data.match(/Exception: (.+) is not installed/);

  if (match && match[1]) {
    const error = new Error(match[1] + ' is not installed');

    error.missingPackage = match[1];

    client.emit('error', error);
  }
}

function isMissingImport(client, data) {
  const match = data.match(/ImportError: No module named '(.+)'/);

  if (match && match[1]) {
    const error = new Error(match[1] + ' is not installed');

    error.missingPackage = match[1];

    client.emit('error', error);
  }
}

/**
 * @param {JupyterClient} client
 * @param {string} source
 * @param {object} data
 */
function handleProcessStreamEvent(client, source, data) {
  if (source === 'stderr.data') {
    data = data.toString();
    isMissingRodeoDependency(client, data);
    isMissingImport(client, data);
  }

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
    id = cuid(),
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
    return write(this.childProcess, {id: cuid(), method: 'input', args: [str]});
  }

  interrupt() {
    const id = cuid(),
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
  log('info', 'getPythonCommandOptions', options);

  return {
    cwd: options.cwd,
    env: pythonLanguage.setDefaultEnvVars(options.env),
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'UTF8'
  };
}

function containsResourcesPath(str) {
  return _.isString(str) && str.indexOf(process.resourcesPath) > -1;
}

function applyPythonCmd(options) {
  if (options.cmd === '<rodeo-builtin-miniconda>' || containsResourcesPath(options.cmd)) {
    options = _.cloneDeep(options);
    options.env = pythonLanguage.setBuiltinDefaultEnvVars(options.env);
    options.cmd = pythonLanguage.getPythonPath();
  }

  return options;
}

/**
 * @param {object} options
 * @param {string} options.cmd
 * @param {string} options.cwd
 * @param {string} options.env
 * @param {string} options.kernelName
 * @returns {ChildProcess}
 */
function createPythonScriptProcess(options) {
  log('info', 'createPythonScriptProcess', options);

  options = resolveHomeDirectoryOptions(options);

  log('info', 'createPythonScriptProcess1', options);

  options = applyPythonCmd(options);

  log('info', 'createPythonScriptProcess2', options);


  const args = ['-c', listenScript, options.kernelName],
    cmdOptions = getPythonCommandOptions(options);

  return processes.create(options.cmd, args, cmdOptions);
}

/**
 * @param {object} options
 * @param {string} options.cmd
 * @param {string} options.cwd
 * @param {string} options.env
 * @param {string} options.kernelName
 * @returns {JupyterClient}
 */
function create(options) {
  assertValidOptions(options);
  const child = createPythonScriptProcess(options),
    client = new JupyterClient(child);

  client.on('ready', () => {
    // when the client is ready, apply our internal code right away
    client.executeHidden(patch, 'executeReply');
  });

  return client;
}

/**
 * Runs a script in python, returns the output with errors and stderr rejecting the results
 * @param {string} script
 * @param {object} [options]
 * @returns {Promise}
 */
function getPythonScriptResults(script, options) {
  options = resolveHomeDirectoryOptions(options);
  const processOptions = getPythonCommandOptions(options);

  return processes.exec(options.cmd, ['-c', script], processOptions);
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
  assertValidOptions(options);

  options = resolveHomeDirectoryOptions(options);

  return getPythonScriptResults(checkScript, options)
    .catch(function (error) {
      return {errors: [error], stdout: '', stderr: ''};
    })
    .timeout(timeouts.checkTimeout, 'Timed out when checking python with ' + JSON.stringify(options))
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

      // guarantee that current working directory exists
      if (!fs.existsSync(options.cwd)) {
        options.cwd = files.resolveHomeDirectory('~');
      }
    }
  }

  return options;
}

function normalizeExecutionResult(result) {
  // convert errors to objects so they can travel across ipc
  result.errors = _.map(result.errors, error => errorClone.toObject(error));

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
        return result.stderr.push(data);
      case 'stdout.data':
        return result.stdout.push(data);
      default:
        return;
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

  return new bluebird(function (resolve, reject, onCancel) {
    assertValidOptions(options);
    options = resolveHomeDirectoryOptions(options);
    const jupyterClient = create(options);

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
    jupyterClient.on('close', (code, signal) => {
      resolve(_.assign({code, signal}, result));
    });

    listenTo(jupyterClient, 'jupyter', result.events);
  }).timeout(timeout, new ProcessError('Timed out waiting for Jupyter to start', {
    options,
    result
  })).then(normalizeExecutionResult);
}

/**
 * If we put our built-in kernel on a special path, conda will come and find it
 * @returns {Promise}
 */
function createBuiltinKernelJson() {
  const condaDir = pythonLanguage.getCondaPath(),
    specialPath = ['share', 'jupyter', 'kernels', 'rodeo-builtin-miniconda'];

  return files.makeDirectoryPathSafe(condaDir, specialPath).then(() => {
    const targetDir = path.join.apply(path, [condaDir].concat(specialPath));

    return files.writeFile(path.join(targetDir, 'kernel.json'), JSON.stringify({
      argv: [
        pythonLanguage.getPythonPath(),
        '-m',
        'ipykernel',
        '-f',
        '{connection_file}' // replaced by a reference to an actual connection file in conda
      ],
      display_name: 'Rodeo Built-in Miniconda',
      language: 'python'
    })).then(function () {
      log('info', 'wrote kernel.json to', targetDir);
    });
  });
}

export default {
  create,
  exec,
  check,
  createBuiltinKernelJson
};
