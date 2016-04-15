'use strict';

/**
 * @module
 * @see http://ipython.org/ipython-doc/stable/api/generated/IPython.kernel.client.html#IPython.kernel.client.KernelClient
 * @see http://jupyter-client.readthedocs.org/en/latest/messaging.html
 */

const _ = require('lodash'),
  bluebird = require('bluebird'),
  EventEmitter  = require('events'),
  fs = require('fs'),
  log = require('../../services/log').asInternal(__filename),
  path = require('path'),
  processes = require('../../services/processes'),
  promises = require('../../services/promises');

function handleProcessStreamStdoutData(client, data) {
  let obj;

  try {
    obj = JSON.parse(data);

    if (obj.status === 'complete' && obj.id === 'startup-complete') {
      client.emit('ready');
    } else {
      client.emit('error', new Error('Unknown data object: ' + require('util').inspect(obj)));
    }
  } catch (ex) {
    client.emit('error', ex);
  }
}

function handleProcessStreamEvent(client, source, data) {
  client.emit('event', source, data);
}

function listenToChild(client, child, prefix) {
  child.stdout.on('data', _.partial(handleProcessStreamEvent, client, prefix + 'stdout.data'));
  child.stdout.on('error', _.partial(handleProcessStreamEvent, client, prefix + 'stdout.error'));
  child.stdout.on('close', _.partial(handleProcessStreamEvent, client, prefix + 'stdout.close'));

  child.stderr.on('data', _.partial(handleProcessStreamEvent, client, prefix + 'stderr.data'));
  child.stderr.on('error', _.partial(handleProcessStreamEvent, client, prefix + 'stderr.error'));
  child.stderr.on('close', _.partial(handleProcessStreamEvent, client, prefix + 'stderr.close'));

  child.on('data', _.partial(handleProcessStreamEvent, client, prefix + 'data'));
  child.on('message', _.partial(handleProcessStreamEvent, client, prefix + 'message'));
  child.on('close', _.partial(handleProcessStreamEvent, client, prefix + 'close'));
  child.on('exit', _.partial(handleProcessStreamEvent, client, prefix + 'exit'));
  child.on('disconnect', _.partial(handleProcessStreamEvent, client, prefix + 'disconnect'));
  child.on('error', _.partial(handleProcessStreamEvent, client, prefix + 'error'));
}

/**
 * @class JupyterClientConsole
 */
class JupyterClientConsole extends EventEmitter {
  constructor(child) {
    super();
    this.childProcess = child;

    listenToChild(this, child, 'JupyterClientConsole.');
  }

  kill() {
    return processes.kill(this.childProcess);
  }
}

/**
 * @returns {Promise<JupyterClientConsole>}
 */
function create() {
  const child = processes.create('jupyter console --existing', {
    shell: '/bin/bash',
    env: _.assign({
      PYTHONUNBUFFERED: true
    }, process.env),
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'UTF8'
  });

  return new JupyterClientConsole(child);
}

module.exports.create = create;