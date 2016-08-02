'use strict';

const bluebird = require('bluebird'),
  path = require('path'),
  processes = require('../processes'),
  packageName = 'rodeo',
  appName = 'Rodeo',
  fileKeyPath = `HKCU\\Software\\Classes\\*\\shell\\${appName}`,
  directoryKeyPath = `HKCU\\Software\\Classes\\directory\\shell\\${appName}`,
  backgroundKeyPath = `HKCU\\Software\\Classes\\directory\\background\\shell\\${appName}`,
  applicationsKeyPath = `HKCU\\Software\\Classes\\Applications\\${packageName}.exe`;

/**
 * @param {string} [systemRoot]
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
 * @param {string} [systemRoot]
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function addToRegistry(args, systemRoot) {
  args.unshift('add');
  args.push('/f');

  return processes.exec(getRegPath(systemRoot), args);
}

/**
 * Remove item from registry
 * @param {string} keyPath
 * @param {string} [systemRoot]
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function deleteFromRegistry(keyPath, systemRoot) {
  const args = ['delete', keyPath, '/f'];

  return processes.exec(getRegPath(systemRoot), args);
}

/**
 * Install file handler
 * @param {string} execPath
 * @param {string} [systemRoot]
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function installFileHandler(execPath, systemRoot) {
  const args = [
    `${applicationsKeyPath}\\shell\\open\\command`,
    '/ve',
    '/d',
    `\"${execPath}\" \"%1\"`
  ];

  return addToRegistry(args, systemRoot);
}

/**
 * @param {string} execPath
 * @param {string} keyPath
 * @param {string} arg
 * @param {string} [systemRoot]
 * @returns {Promise}
 */
function installMenu(execPath, keyPath, arg, systemRoot) {
  const args = [keyPath, '/ve', '/d', `Open with ${appName}`];

  return bluebird.all([
    addToRegistry(args, systemRoot),
    addToRegistry([keyPath, '/v', 'Icon', '/d', `\"${execPath}\"`], systemRoot),
    addToRegistry([`${keyPath}\\command`, '/ve', '/d', `\"${execPath}\" \"${arg}\"`], systemRoot)
  ]);
}

/**
 * @param {string} execPath
 * @param {string} [systemRoot]
 * @returns {Promise}
 */
function install(execPath, systemRoot) {
  return bluebird.all([
    installMenu(execPath, fileKeyPath, '%1', systemRoot),
    installMenu(execPath, directoryKeyPath, '%1', systemRoot),
    installMenu(execPath, backgroundKeyPath, '%V', systemRoot),
    installFileHandler(execPath, systemRoot)
  ]);
}

/**
 * @param {string} [systemRoot]
 * @returns {Promise}
 */
function uninstall(systemRoot) {
  return bluebird.all([
    deleteFromRegistry(fileKeyPath, systemRoot),
    deleteFromRegistry(directoryKeyPath, systemRoot),
    deleteFromRegistry(backgroundKeyPath, systemRoot),
    deleteFromRegistry(applicationsKeyPath, systemRoot)
  ]);
}

module.exports.install = install;
module.exports.uninstall = uninstall;
