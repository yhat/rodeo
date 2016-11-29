'use strict';

import path from 'path';
import processes from '../processes';

/**
 * @param {string} systemRoot
 * @returns {string}
 * @example setSystemRoot(process.env.SystemRoot);
 */
function getRegPath(systemRoot) {
  if (systemRoot) {
    return path.join(systemRoot, 'System32', 'reg.exe');
  }

  return 'reg.exe';
}

/**
 * Add item to registry
 * @param {[string]} args
 * @param {string} systemRoot
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function add(args, systemRoot) {
  args.unshift('add');
  args.push('/f');

  return processes.exec(getRegPath(systemRoot), args);
}

/**
 * Remove item from registry
 * @param {string} keyPath
 * @param {string} systemRoot
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function remove(keyPath, systemRoot) {
  const args = ['delete', keyPath, '/f'];

  return processes.exec(getRegPath(systemRoot), args);
}

module.exports.add = add;
module.exports.remove = remove;
