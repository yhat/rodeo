/**
 * @see https://msdn.microsoft.com/en-us/library/windows/desktop/cc144171(v=vs.85).aspx
 */

import bluebird from 'bluebird';
import win32Registry from '../win32/registry';

const packageName = 'rodeo',
  appName = 'Rodeo',
  fileKeyPath = `HKCU\\Software\\Classes\\.py\\shell\\${appName}`,
  directoryKeyPath = `HKCU\\Software\\Classes\\directory\\shell\\${appName}`,
  backgroundKeyPath = `HKCU\\Software\\Classes\\directory\\background\\shell\\${appName}`,
  applicationsKeyPath = `HKCU\\Software\\Classes\\Applications\\${packageName}.exe`;

/**
 * Install file handler
 * @param {string} execPath
 * @param {string} systemRoot
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function installFileHandler(execPath, systemRoot) {
  const args = [
    `${applicationsKeyPath}\\shell\\open\\command`,
    '/ve',
    '/d',
    `\"${execPath}\" \"%1\"`
  ];

  return win32Registry.add(args, systemRoot);
}

/**
 * @param {string} execPath
 * @param {string} keyPath
 * @param {string} arg
 * @param {string} systemRoot
 * @returns {Promise}
 */
function installMenu(execPath, keyPath, arg, systemRoot) {
  const args = [keyPath, '/ve', '/d', `Open with ${appName}`];

  return bluebird.all([
    win32Registry.add(args, systemRoot),
    win32Registry.add([keyPath, '/v', 'Icon', '/d', `\"${execPath}\"`], systemRoot),
    win32Registry.add([`${keyPath}\\command`, '/ve', '/d', `\"${execPath}\" \"${arg}\"`], systemRoot)
  ]);
}

/**
 * @param {string} execPath
 * @param {string} systemRoot
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
 * @param {string} systemRoot
 * @returns {Promise}
 */
function uninstall(systemRoot) {
  return bluebird.all([
    win32Registry.remove(fileKeyPath, systemRoot),
    win32Registry.remove(directoryKeyPath, systemRoot),
    win32Registry.remove(backgroundKeyPath, systemRoot),
    win32Registry.remove(applicationsKeyPath, systemRoot)
  ]);
}

module.exports.install = install;
module.exports.uninstall = uninstall;
