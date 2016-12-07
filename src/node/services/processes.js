import _ from 'lodash';
import assert from './assert';
import bluebird from 'bluebird';
import childProcess from 'child_process';

const log = require('./log').asInternal(__filename),
  children = [],
  killTimeout = 5000,
  assertString = assert(['string', 'must be string']);

/**
 * @param {ChildProcess} child
 * @param {object} details
 */
function addChild(child, details) {
  children.push(child);
  log('info', 'added child process', _.assign({pid: child.pid}, details), ';', children.length, 'children running');
}

/**
 * @param {ChildProcess} child
 * @param {object} details
 */
function removeChild(child, details) {
  _.pull(children, child);
  log('info', 'removed child process', _.assign({pid: child.pid}, details), ';', children.length, 'children running');
}

function errorInChild(child, error, details) {
  log('info', 'error in child process', _.assign({pid: child.pid, error}, details), ';', children.length, 'children running');
}

/**
 * @returns {Array}
 */
function getChildren() {
  return children;
}

/**
 * @param {string} cmd
 * @param {Array} [args]
 * @param {object} [options]
 * @returns {ChildProcess}
 */
function create(cmd, args, options) {
  assertString(cmd);

  args = args || options;
  options = args && options;

  const errors = [],
    details = {cmd, args, options},
    child = childProcess.spawn(cmd, args, options);

  child.on('error', error => {
    errors.push(error);
    errorInChild(child, error, details);
  }).on('close', (code, signal) => removeChild(child, _.assign({code, signal, errors}, details)));

  addChild(child, details);
  return child;
}

/**
 * @param {string} str
 * @param {Array} [args]
 * @param {object} [options]
 * @returns {Promise<{errors: [Error], stderr: string, stdout: string}>}
 */
function exec(str, args, options) {
  assertString(str);

  return new bluebird(function (resolve) {
    const child = create(str, args, options);
    let stdout = [],
      stderr = [],
      errors = [];

    child.stdout.on('data', data => stdout.push(data));
    child.stderr.on('data', data => stderr.push(data));
    child.on('error', data => errors.push(data));
    child.on('close', function (code, signal) {
      resolve({
        errors,
        stderr: stderr.join(''),
        stdout: stdout.join(''),
        code,
        signal
      });
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
  }).timeout(killTimeout, 'failed to kill child process ' + childProcess.pid);
}

export default {
  getChildren,
  create,
  exec,
  kill
};
