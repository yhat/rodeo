'use strict';

const _ = require('lodash'),
  EventEmitter  = require('events'),
  processes = require('../../services/processes');


function handleProcessStreamEvent(client, source, data) {
  client.emit('event', source, data);
}

function listenToChild(client, child) {
  child.stdout.on('data', _.partial(handleProcessStreamEvent, client, 'stdout.data'));
  child.stdout.on('error', _.partial(handleProcessStreamEvent, client, 'stdout.error'));
  child.stdout.on('close', _.partial(handleProcessStreamEvent, client, 'stdout.close'));

  child.stderr.on('data', _.partial(handleProcessStreamEvent, client, 'stderr.data'));
  child.stderr.on('error', _.partial(handleProcessStreamEvent, client, 'stderr.error'));
  child.stderr.on('close', _.partial(handleProcessStreamEvent, client, 'stderr.close'));

  child.on('data', _.partial(handleProcessStreamEvent, client, 'data'));
  child.on('message', _.partial(handleProcessStreamEvent, client, 'message'));
  child.on('close', _.partial(handleProcessStreamEvent, client, 'close'));
  child.on('exit', _.partial(handleProcessStreamEvent, client, 'exit'));
  child.on('disconnect', _.partial(handleProcessStreamEvent, client, 'disconnect'));
  child.on('error', _.partial(handleProcessStreamEvent, client, 'error'));
}

class JupyterKernel extends EventEmitter {
  constructor(child) {
    super();
    this.childProcess = child;

    listenToChild(this, child);
  }

  kill() {
    return processes.kill(this.childProcess);
  }
}

/**
 * @param {object} [options]
 * @returns {JupyterKernel}
 */
function create(options) {
  options = {} || options;
  const args = [
    'matplotlib=inline'
  ];
  let child;

  if (options['log-level']) {
    args.push('--log-level=' + options['log-level'].toUpperCase());
  }

  child = processes.create('ipython kernel', args, {
    shell: '/bin/bash',
    env: _.assign({
      PYTHONUNBUFFERED: true
    }, process.env),
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'UTF8'
  });

  return new JupyterKernel(child);
}

module.exports.create = create;