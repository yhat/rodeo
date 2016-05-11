'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  childProcess = require('child_process'),
  log = require('./log').asInternal(__filename),
  children = [];

/**
 * @param {ChildProcess} child
 */
function addChild(child) {
  children.push(child);
  log('debug', 'added child process', child.pid, ';', children.length, 'children running');
}

/**
 * @param {ChildProcess} child
 */
function removeChild(child) {
  _.pull(children, child);
  log('debug', 'removed child process', child.pid, ';', children.length, 'children running');
}

/**
 * @returns {Array}
 */
function getChildren() {
  return children;
}

/**
 * @param {string} str
 * @param {Array} [args]
 * @param {object} [options]
 * @returns {ChildProcess}
 */
function create(str, args, options) {
  const child = childProcess.spawn(str, args || options, args && options)
    .on('close', () => removeChild(child));

  addChild(child);
  return child;
}

/**
 * @param {string} str
 * @param {Array} [args]
 * @param {object} [options]
 * @returns {Promise}
 */
function run(str, args, options) {
  return new bluebird(function (resolve, reject) {
    const child = create(str, args, options);
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

/**
 * @param {ChildProcess}childProcess
 * @returns {Promise}
 */
function kill(childProcess) {
  return new bluebird(function (resolve) {
    childProcess.on('close', function (code, signal) {
      resolve({code, signal});
    });
    childProcess.kill();
  }).timeout(5000, 'failed to kill child process ' + childProcess.pid);
}

module.exports.getChildren = getChildren;
module.exports.create = create;
module.exports.run = run;
module.exports.kill = kill;
