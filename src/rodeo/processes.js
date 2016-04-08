'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  childProcess = require('child_process'),
  log = require('./log').asInternal(__filename),
  children = [];

function addChild(child) {
  children.push(child);
  log('debug', 'added child process', child.uid, ';', children.length, 'children running');
}

function removeChild(child) {
  _.pull(children, child);
  log('debug', 'removed child process', child.uid, ';', children.length, 'children running');
}

function createChildProcessStream(str, options) {
  const child = childProcess.spawn(str, [], options);

  child.stdout.on('data', (data) => { log('info', 'child', child.uid, 'stdout:data', data); });
  child.stdout.on('error', (data) => { log('info', 'child', child.uid, 'stdout:error', data); });
  child.stdout.on('close', (data) => { log('info', 'child', child.uid, 'stdout:close', data); });

  child.stderr.on('data', (data) => { log('info', 'child', child.uid, 'stderr:data', data); });
  child.stderr.on('error', (data) => { log('info', 'child', child.uid, 'stderr:error', data); });
  child.stderr.on('close', (data) => { log('info', 'child', child.uid, 'stderr:close', data); });

  child.on('close', (code) => {
    removeChild(child);
    log('info', 'child', child.uid, 'exited with code', code);
  });

  child.on('close', (data) => { log('info', 'child', child.uid, 'close', data); });
  child.on('exit', (data) => { log('info', 'child', child.uid, 'exit', data); });
  child.on('disconnect', (data) => { log('info', 'child', child.uid, 'disconnect', data); });
  child.on('error', (data) => { log('info', 'child', child.uid, 'error', data); });

  addChild(child);
  return child;
}

/**
 * @param {string} str
 * @param {object} [options]  Optional options
 * @param {number} [options.timeout=5000]  Optional time limit for task to complete before failing
 * @returns {Promise}
 */
function getShellTaskOutputWithExec(str, options) {
  return new bluebird(function (resolve, reject) {
    options = _.defaults(options || {}, {
      timeout: 5000 // if they don't provide one, assume there is one (they can use 0 to disable)
    });

    log('info', 'getShellTaskOutput', str, options);
    const child = childProcess.exec(str, options, function (error, stdout, stderr) {
      removeChild(child);

      // only output "diagnostic" messages from shell tasks if at debug level
      log('info', 'stderr:', stderr);

      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });

    addChild(child);
  });
}

/**
 * @param {string} str
 * @param {object} [options]  Optional options
 * @param {number} [options.timeout=5000]  Optional time limit for task to complete before failing
 * @returns {Promise}
 */
function getShellTaskOutputWithSpawn(str, options) {
  return new Promise(function (resolve, reject) {
    options = _.defaults(options || {}, {
      shell: '/bin/bash',
      env: { ELECTRON_RUN_AS_NODE: true },
      timeout: 5000 // if they don't provide one, assume there is one (they can use 0 to disable)
    });


    log('debug', 'getShellTaskOutput', str, options);

    const stderr = [],
      stdout = [],
      child = createChildProcessStream(str, options);

    child.stdout.on('data', function (data) {
      stdout.push(data);
    });
    child.stderr.on('error', function (error) {
      stderr.push(error);
    });
    child.on('close', function (code) {
      if (code) {
        reject(new Error('Code ' + code));
      } else {
        resolve(stdout.join(''));
      }
    });

    addChild(child);
  });
}

module.exports.getShellTaskOutput = getShellTaskOutputWithSpawn;
module.exports.createChildProcessStream = createChildProcessStream;
