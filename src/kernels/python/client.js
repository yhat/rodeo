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
      log('error', 'Cannot parse to JSON', require('util').inspect(token), ex);
      // we don't have enough data yet, maybe?
    }

    // outputDeferred = client.trigger('item', obj);
    //
    // log('info', 'new object', obj);
    //
    // if (obj && obj.status === 'complete' && obj.id === 'startup-complete') {
    //   emit('ready');
    // } else if (obj && obj.code) {
    //   /* example: { stream: null, image: null, msg_id: '27ce9a29-d146-4c2f-9042-62e3fb20dcd7',
    //    error: null, output: '', id: 'f9fc4759-4c9c-46b1-990b-c2b164cde9e6' } */
    //
    //   // id is internal to this class only, remove it before it can escape
    //   log('info', 'conclusion', 'repeated');
    // } else if (obj && !obj.output) {
    //   log('info', 'conclusion', 'empty output');
    // } else if (outputDeferred) {
    //   /* example: { stream: null, image: null, msg_id: '27ce9a29-d146-4c2f-9042-62e3fb20dcd7',
    //    error: null, output: '', id: 'f9fc4759-4c9c-46b1-990b-c2b164cde9e6' } */
    //   // id is internal to this class only, remove it before it can escape
    //   outputDeferred.unknownMessage = true;
    //   outputDeferred.resolve(_.omit(obj, 'id'));
    //   log('info', 'resolved request but empty output');
    // } else {
    //   emit('error', new Error('Unknown data object: ' + require('util').inspect(obj)));
    // }
  });
  stream.on('error', error => emitter.emit('error', error) );
  stream.on('done', obj => emitter.emit('end', obj) );

  return emitter;
}

function handleProcessStreamEvent(client, source, data) {
  log('error', source, data);
  client.emit('event', source, data);
}

function handleProcessStreamObject(client, obj) {
  let outputItem = client.outputMap[obj.id];

  log('info', 'handling object', obj);

  if (obj.status === 'complete' && obj.id === 'startup-complete') {
    client.emit('ready');
  } else if (obj.code) {
    /* example: { stream: null, image: null, msg_id: '27ce9a29-d146-4c2f-9042-62e3fb20dcd7',
     error: null, output: '', id: 'f9fc4759-4c9c-46b1-990b-c2b164cde9e6' } */

    // id is internal to this class only, remove it before it can escape
    log('info', 'conclusion', 'repeated');
  } else if (!obj.output) {
    log('info', 'conclusion', 'empty output');
  } else if (outputItem) {
    /* example: { stream: null, image: null, msg_id: '27ce9a29-d146-4c2f-9042-62e3fb20dcd7',
     error: null, output: '', id: 'f9fc4759-4c9c-46b1-990b-c2b164cde9e6' } */
    // id is internal to this class only, remove it before it can escape
    outputItem.unknownMessage = true;
    outputItem.resolve(_.omit(obj, 'id'));
    log('info', 'resolved request but empty output');
  } else {
    emit('error', new Error('Unknown data object: ' + require('util').inspect(obj)));
  }
}

function listenToChild(client, child) {
  const objectEmitter = createObjectEmitter(child.stdout);

  objectEmitter.on('data', _.partial(handleProcessStreamObject, client));
  objectEmitter.on('error', _.partial(handleProcessStreamEvent, client, 'objectEmitter.error'));
  objectEmitter.on('end', _.partial(handleProcessStreamEvent, client, 'objectEmitter.error'));

  child.stdout.on('error', _.partial(handleProcessStreamEvent, client, 'stdout.error'));
  child.stdout.on('close', _.partial(handleProcessStreamEvent, client, 'stdout.close'));
  child.stdout.on('readable', _.partial(handleProcessStreamEvent, client, 'stdout.readable'));

  child.stderr.on('data', _.partial(handleProcessStreamEvent, client, 'stderr.data'));
  child.stderr.on('error', _.partial(handleProcessStreamEvent, client, 'stderr.error'));
  child.stderr.on('close', _.partial(handleProcessStreamEvent, client, 'stderr.close'));
  child.stdout.on('readable', _.partial(handleProcessStreamEvent, client, 'stderr.readable'));

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

/**
 * @class JupyterClient
 */
class JupyterClient extends EventEmitter {
  constructor(child) {
    super();
    this.childProcess = child;
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
   */
  execute(code, options) {
    const childProcess = this.childProcess,
      outputMap = this.outputMap,
      id = uuid.v4().toString(),
      inputPromise = write(childProcess, {
        id,
        method: 'execute',
        args: _.assign({code}, toPythonArgs(options))
      }),
      deferred = new bluebird.defer(),
      outputPromise = deferred.promise,
      outputItem = {};

    outputItem.deferred = deferred;

    outputMap[id] = outputItem;

    return inputPromise.then(function () {
      log('execution started', id);

      return outputPromise;
    }).then(function () {
      log('info', 'execution completed', id, result);
      return outputItem;
    }).finally(function () {
      // clean up reference, no matter what the result
      delete outputMap[id];
    });
  }

  getIOPubMsg() {
    throw new Error('Not implemented');
  }

  getShellMsg() {
    throw new Error('Not implemented');
  }

  getStdinMsg() {
    throw new Error('Not implemented');
  }

  getHBChannel() {
    throw new Error('Not implemented');
  }

  /**
   * @param {boolean} raw
   * @param {boolean} output
   * @param {string} historyAccessType
   */
  getHistory(raw, output, historyAccessType) {
    throw new Error('Not implemented');
  }

  /**
   * @returns {boolean}
   */
  isAlive() {
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