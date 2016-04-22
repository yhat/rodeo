'use strict';

/**
 * @module
 * @see http://ipython.org/ipython-doc/stable/api/generated/IPython.kernel.client.html#IPython.kernel.client.KernelClient
 * @see http://jupyter-client.readthedocs.org/en/latest/messaging.html
 */

const _ = require('lodash'),
  bluebird = require('bluebird'),
  EventEmitter = require('events'),
  StreamSplitter = require('stream-splitter'),
  log = require('../../services/log').asInternal(__filename),
  path = require('path'),
  processes = require('../../services/processes'),
  promises = require('../../services/promises'),
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

function handleProcessStreamEvent(client, source, data) {
  log('error', source, data);
  client.emit('event', source, data);
}

function linkRequestToOutput(client, obj) {
  const requestMap = client.requestMap,
    outputMap = client.outputMap;

  requestMap[obj.id].msg_id = obj.result;
  outputMap[obj.result] = {id: obj.id, msg_id: obj.result, children: []};
}

function requestInputFromUser(client, message) {
  client.emit('input_request', message);
}

function broadcastKernelStatus(client, message) {
  client.emit('status', message.content.execution_state);
}

function resolveRequest(client, id, message) {
  const requestMap = client.requestMap;

  // payload is deprecated, so don't even expose it
  requestMap[id].deferred.resolve(_.omit(message.content, 'payload', 'engine_info', 'execution_count'));
}


function handleProcessStreamObject(client, obj) {
  const requestMap = client.requestMap,
    outputMap = client.outputMap,
    source = obj.source,
    result = obj.result,
    parentMessageId = _.get(result, 'parent_header.msg_id');

  if (obj.status === 'complete' && obj.id === 'startup-complete') {
    client.emit('ready');
  } else if (obj.id && result && requestMap[obj.id]) {
    linkRequestToOutput(client, obj);
  } else if (result && outputMap[parentMessageId] ) {
    // child event
    let parent, child, request;

    parent = outputMap[parentMessageId];
    child = _.omit(result, ['msg_id', 'parent_header']);
    child.header = _.omit(child.header, ['version', 'msg_id', 'session', 'username', 'msg_type']);
    parent.children.push(child);
    if (!parent.header) {
      parent.header = result.parent_header;
    }

    if (source === 'stdin' && child.msg_type === 'input_request') {
      requestInputFromUser(client, result);
    }

    request = requestMap[parent.id];
    if (request) {
      if (_.isArray(request.successEvent) && _.includes(request.successEvent, child.msg_type)) {
        resolveRequest(client, parent.id, result);
      } else if (request.successEvent === child.msg_type) {
        resolveRequest(client, parent.id, result);
      }
    }

    if (child.msg_type === 'status') {
      broadcastKernelStatus(client, result);
    }

    client.emit(source, obj);
  } else if (result) {
    client.emit(source, obj);
  } else if (obj.id && result === null) {
    // ignore, they didn't give us a msg_id and that's okay
  } else {
    client.emit('error', new Error('Unknown data object: ' + require('util').inspect(obj)));
  }
}

function listenToChild(client, child) {
  const objectEmitter = createObjectEmitter(child.stdout);

  objectEmitter.on('data', _.partial(handleProcessStreamObject, client));


  objectEmitter.on('error', _.partial(handleProcessStreamEvent, client, 'objectEmitter.error'));
  objectEmitter.on('end', _.partial(handleProcessStreamEvent, client, 'objectEmitter.end'));

  child.stdout.on('error', _.partial(handleProcessStreamEvent, client, 'stdout.error'));

  child.stderr.on('data', _.partial(handleProcessStreamEvent, client, 'stderr.data'));
  child.stderr.on('error', _.partial(handleProcessStreamEvent, client, 'stderr.error'));

  child.on('error', _.partial(handleProcessStreamEvent, client, 'error'));
}

function startIPython(child) {
  // do nothing at the moment
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
 * @param {object} args
 * @returns {object}
 */
function toPythonArgs(args) {
  return _.reduce(args, function (obj, value, key) {
    obj[_.snakeCase(key)] = value;
    return obj;
  }, {});
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
    this.outputMap = {};

    listenToChild(this, child);
    startIPython(child);
  }

  /**
   * @param {string} code
   * @param {number} [cursorPos]
   * @returns {Promise}
   */
  complete(code, cursorPos) {
    throw new Error('Not implemented');
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
      kwargs: _.assign({code}, toPythonArgs(args))
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
      kwargs: _.assign({code}, toPythonArgs(args))
    }, {successEvent: ['execute_results', 'display_data', 'stream']});
  }

  /**
   * @param {boolean} raw
   * @param {boolean} output
   * @param {string} historyAccessType
   */
  getHistory(raw, output, historyAccessType) {
    throw new Error('Not implemented');
  }

  kill() {
    return processes.kill(this.childProcess);
  }
}

/**
 * @returns {Promise<JupyterClient>}
 */
function create() {
  const target = path.resolve(path.join(__dirname, 'start_kernel.py'));

  return bluebird.try(function () {
    const child = processes.create('python', [target], {
        env: _.assign({
          PYTHONUNBUFFERED: '1'
        }, process.env),
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'UTF8'
      }),
      client = new JupyterClient(child);

    return promises.eventsToPromise(client, {resolve: 'ready', reject: 'error'})
      .then(_.constant(client));
  });
}

/**
 * Runs a script in python, returns the output with errors and stderr rejecting the results
 * @param {string} target
 * @returns {Promise}
 */
function runPythonScript(target) {
  return new bluebird(function (resolve, reject) {
    const child = processes.create('python', [target], {
      env: _.assign({
        PYTHONUNBUFFERED: '1'
      }, process.env),
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'UTF8'
    });
    let stdout = [],
      stderr = [],
      errors = [];

    child.stdout.on('data', data => stdout.push(data));
    child.stderr.on('data', data => stderr.push(data));
    child.on('error', data => errors.push(data));
    child.on('close', function () {
      if (errors.length) {
        reject(_.first(errors));
      } else if (stderr.length) {
        reject(new Error(stderr.join('')));
      } else {
        resolve(stdout.join(''));
      }
    });
  });
}

function checkPython() {
  const target = path.resolve(path.join(__dirname, 'check_python.py'));

  return exports.runPythonScript(target).then(JSON.parse);
}

module.exports.create = create;
module.exports.runPythonScript = runPythonScript;
module.exports.checkPython = checkPython;