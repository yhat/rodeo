'use strict';

/**
 * @module
 * @see http://ipython.org/ipython-doc/stable/api/generated/IPython.kernel.client.html#IPython.kernel.client.KernelClient
 * @see http://jupyter-client.readthedocs.org/en/latest/messaging.html
 */

const _ = require('lodash'),
  bluebird = require('bluebird'),
  EventEmitter = require('events'),
  fs = require('fs'),
  StreamSplitter = require('stream-splitter'),
  log = require('../../services/log').asInternal(__filename),
  path = require('path'),
  processes = require('../../services/processes'),
  promises = require('../../services/promises'),
  uuid = require('uuid'),
  stream = require('stream');

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

function handleExecutionResults(client, parent, child) {
  const content = child.content;

  switch(child.msg_type) {
    case 'execute_reply':
      if (content.status === 'ok') {
        log('info', 'Code ran alright', content.execution_count);
      } else if (content.status === 'error') {
        log('error', 'Nothing is good with request number', content.execution_count,
          {ename: content.ename, evalue: content.evalue, traceback: content.traceback});
      }
      break;
    case 'complete_reply':
      if (content.status === 'ok') {
        log('info', 'Code completion alright');
      } else if (content.status === 'error') {
        log('error', 'Nothing is good',
          {ename: content.ename, evalue: content.evalue, traceback: content.traceback});
      }
      break;
    case 'is_complete_reply':
      log('info', 'Is code complete? alright', content.status);
      break;
    case 'execute_input':
      log('info', 'Someone (anyone!) is running ', content.execution_count,':\n', content.code);
      break;
    case 'execute_result':
      log('info', 'Someone has some results:', content.execution_count,':\n', content.data);
      break;
    case 'error':
      log('error', 'Someone has an error:', {ename: content.ename, evalue: content.evalue, traceback: content.traceback});
      break;
    case 'status':
      log('info', 'The kernel is', content.execution_state); // ('busy', 'idle', 'starting')
      break;
    case 'clear_output':
      log('info', 'clear the decks');
      break;
    default:
      log('warn', 'what?', child);
  }
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
  requestMap[id].deferred.resolve(_.omit(message.content, 'payload'));
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
    let parent, child;

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

    switch (child.msg_type) {
      case 'execute_reply': resolveRequest(client, parent.id, result); break;
      case 'status': broadcastKernelStatus(client, result); break;
      default: break;
    }

    log('info', source, result);
    client.emit(source, obj);
  } else if (result) {
    log('info', source, 'unknown:', result);

    client.emit(source, obj);
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
  child.stdout.on('close', _.partial(handleProcessStreamEvent, client, 'stdout.close'));

  child.stderr.on('data', _.partial(handleProcessStreamEvent, client, 'stderr.data'));
  child.stderr.on('error', _.partial(handleProcessStreamEvent, client, 'stderr.error'));

  child.on('data', _.partial(handleProcessStreamEvent, client, 'data'));
  child.on('message', _.partial(handleProcessStreamEvent, client, 'message'));
  child.on('close', _.partial(handleProcessStreamEvent, client, 'close'));
  child.on('exit', _.partial(handleProcessStreamEvent, client, 'exit'));
  child.on('disconnect', _.partial(handleProcessStreamEvent, client, 'disconnect'));
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

function run() {

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
   * @returns {Promise}
   */
  getChannelsRunning() {
    throw new Error('Not implemented');
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
   * @param {object} [options]
   * @param {boolean} [options.silent]
   * @param {boolean} [options.storeHistory]
   * @param {object} [options.userExpressions]
   * @param {boolean} [options.allowStdin]
   * @param {boolean} [options.stopOnError]
   * @returns {Promise<object>}
   */
  execute(code, options) {
    const childProcess = this.childProcess,
      requestMap = this.requestMap,
      id = uuid.v4().toString(),
      inputPromise = write(childProcess, {
        id,
        method: 'execute',
        kwargs: _.assign({code}, toPythonArgs(options))
      }),
      deferred = new bluebird.defer(),
      request = { id: id, deferred: deferred };

    request.deferred = deferred;
    requestMap[id] = request;

    return inputPromise.then(function () {
      return deferred.promise;
    }).finally(function () {
      // clean up reference, no matter what the result
      delete requestMap[id];
    });
  }

  input(str) {
    const childProcess = this.childProcess,
      requestMap = this.requestMap,
      id = uuid.v4().toString(),
      inputPromise = write(childProcess, {
        id,
        method: 'input',
        args: [str]
      }),
      deferred = new bluebird.defer(),
      request = { id: id, deferred: deferred };

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

module.exports.create = create;