/**
 * @see https://github.com/atom/atom/blob/32a1d21a0debe14f159b3cbf945827d4fb7bdf30/src/browser/squirrel-update.coffee#L227
 */

'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  processes = require('./processes'),
  path = require('path'),
  os = require('os'),
  files = require('./files');

let system32Path, regPath, powershellPath, setxPath, appFolder, rootRodeoFolder, binFolder,
  updateDotExe, exeName, execPath,
  packageName = 'rodeo',
  appName = 'Rodeo',
  fileKeyPath = `HKCU\\Software\\Classes\\*\\shell\\${appName}`,
  directoryKeyPath = `HKCU\\Software\\Classes\\directory\\shell\\${appName}`,
  backgroundKeyPath = `HKCU\\Software\\Classes\\directory\\background\\shell\\${appName}`,
  applicationsKeyPath = `HKCU\\Software\\Classes\\Applications\\${packageName}.exe`;

setExecPath(process.execPath);
setSystemRoot(process.env.SystemRoot);

/**
 * Run the registry editor
 * @param {[string]} args
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function spawnReg(args) {
  return processes.exec(regPath, args);
}

/**
 * Run the powershell
 * @param {[string]} args
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function spawnPowershell(args) {
  // set encoding and execute the command, capture the output, and return it via .NET's console in order to have consistent UTF-8 encoding
  // http://stackoverflow.com/questions/22349139/utf-8-output-from-powershell
  // to address https://github.com/atom/atom/issues/5063
  args[0] = [
    '[Console]::OutputEncoding=[System.Text.Encoding]::UTF8',
    `$output=${args[0]}`,
    '[Console]::WriteLine($output)'
  ].join('\n');
  args.unshift('-command');
  args.unshift('RemoteSigned');
  args.unshift('-ExecutionPolicy');
  args.unshift('-noprofile');
  return processes.exec(powershellPath, args);
}

/**
 * Add item to registry
 * @param {[string]} args
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function addToRegistry(args) {
  args.unshift('add');
  args.push('/f');
  return spawnReg(args);
}

/**
 * Remove item from registry
 * @param {string} keyPath
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function deleteFromRegistry(keyPath) {
  return spawnReg(['delete', keyPath, '/f']);
}

/**
 * Install file handler
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function installFileHandler() {
  const args = [
    `${applicationsKeyPath}\\shell\\open\\command`,
    '/ve',
    '/d',
    `\"${execPath}\" \"%1\"`
  ];

  return addToRegistry(args);
}

function installMenu(keyPath, arg) {
  const args = [keyPath, '/ve', '/d', `Open with ${appName}`];

  return bluebird.all([
    addToRegistry(args),
    addToRegistry([keyPath, '/v', 'Icon', '/d', `\"${execPath}\"`]),
    addToRegistry([`${keyPath}\\command`, '/ve', '/d', `\"${execPath}\" \"${arg}\"`])
  ]);
}

function createShortcuts() {
  return processes.exec(updateDotExe, ['--createShortcut', exeName]);
}

function updateShortcuts() {
  const homeDirectory = os.homedir();

  if (homeDirectory) {
    const desktopShortcutPath = path.join(homeDirectory, 'Desktop', `${appName}.lnk`);

    // Check if the desktop shortcut has been previously deleted and
    // and keep it deleted if it was
    return files.exists(desktopShortcutPath)
      .then(exists => {
        return createShortcuts().then(() => {
          if (!exists) {
            return files.unlink(desktopShortcutPath);
          }
        });
      });
  } else {
    return createShortcuts();
  }
}

function removeShortcuts() {
  return processes.exec(updateDotExe, ['--removeShortcut', exeName]);
}

function installContextMenu() {
  return bluebird.all([
    installMenu(fileKeyPath, '%1'),
    installMenu(directoryKeyPath, '%1'),
    installMenu(backgroundKeyPath, '%V'),
    installFileHandler()
  ]);
}

function uninstallContextMenu() {
  return bluebird.all([
    deleteFromRegistry(fileKeyPath),
    deleteFromRegistry(directoryKeyPath),
    deleteFromRegistry(backgroundKeyPath),
    deleteFromRegistry(applicationsKeyPath)
  ]);
}

function spawnSetx(args) {
  return processes.exec(setxPath, args);
}

function addBinToPath(pathSegments) {
  pathSegments.push(binFolder);

  return spawnSetx(['Path', pathSegments.join(';')]);
}

function installCommands() {
  const appName = 'rodeo',
    atomCommandPath = path.join(binFolder, appName + '.cmd'),
    relativeAtomPath = path.relative(binFolder, path.join(appFolder, 'resources', 'cli', appName + '.cmd')),
    atomCommand = `@echo off\r\n\"%~dp0\\${relativeAtomPath}\" %*`,
    atomShCommandPath = path.join(binFolder, 'atom'),
    relativeAtomShPath = path.relative(binFolder, path.join(appFolder, 'resources', 'cli', appName + '.sh')),
    atomShCommand = `#!/bin/sh\r\n\"$(dirname \"$0\")/${relativeAtomShPath.replace(/\\/g, '/')}\" \"$@\"\r\necho`;

  console.log('info', 'installCommands HOOOO', files.writeFile);

  return bluebird.all([
    files.writeFile(atomCommandPath, atomCommand),
    files.writeFile(atomShCommandPath, atomShCommand)
  ]);
}

function getPath() {
  return spawnPowershell(['[environment]::GetEnvironmentVariable(\'Path\',\'User\')'])
    .then(function (result) {
      return result.stdout.replace(/^\s+|\s+$/g, '');
    });
}

function addCommandsToPath() {
  return installCommands()
    .then(() => getPath())
    .then(function (pathEnv) {
      const pathSegments = pathEnv.split(/;+/).filter(_.identity);

      if (pathSegments.indexOf(binFolder) === -1) {
        return addBinToPath(pathSegments);
      }
    });
}

function removeCommandsFromPath() {
  return getPath()
    .then(pathEnv => {
      const pathSegments = pathEnv.split(/;+/)
          .filter(pathSegment => pathSegment && pathSegment !== binFolder),
        newPathEnv = pathSegments.join(';');

      if (pathEnv !== newPathEnv) {
        return spawnSetx(['Path', newPathEnv]);
      }
    });
}

/**
 *
 * @param {electron.app} app
 * @returns {Promise<boolean>}
 */
function handleSquirrelStartupEvent(app) {
  if (process.platform !== 'win32') {
    return bluebird.resolve(false);
  }

  return bluebird.try(function () {
    const squirrelCommand = process.argv[1];

    switch (squirrelCommand) {
      case '--squirrel-install':
        return bluebird.all([
          createShortcuts(),
          installContextMenu(),
          addCommandsToPath()
        ]).then(() => app.quit())
          .return(true);
      case '--squirrel-updated':
        return bluebird.all([
          updateShortcuts(),
          installContextMenu(),
          addCommandsToPath()
        ]).then(() => app.quit())
          .return(true);
      case '--squirrel-uninstall':
        return bluebird.all([
          removeShortcuts(),
          uninstallContextMenu(),
          removeCommandsFromPath()
        ]).then(() => app.quit())
          .return(true);
      case '--squirrel-obsolete':
        app.quit();
        return true;
      default:
        return false;
    }
  });
}

/**
 * @param {string} value
 * @example setExecPath(process.execPath);
 */
function setExecPath(value) {
  execPath = value;
  appFolder = path.resolve(execPath, '..');
  rootRodeoFolder = path.resolve(appFolder, '..');
  binFolder = path.join(rootRodeoFolder, 'bin');
  updateDotExe = path.join(rootRodeoFolder, 'Update.exe');
  exeName = path.basename(execPath);
}

/**
 * @param {string} systemRoot
 * @example setSystemRoot(process.env.SystemRoot);
 */
function setSystemRoot(systemRoot) {
  if (systemRoot) {
    system32Path = path.join(systemRoot, 'System32');
    regPath = path.join(system32Path, 'reg.exe');
    powershellPath = path.join(system32Path, 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    setxPath = path.join(system32Path, 'setx.exe');
  } else {
    regPath = 'reg.exe';
    powershellPath = 'powershell.exe';
    setxPath = 'setx.exe';
  }
}

module.exports.getPath = getPath;
module.exports.installCommands = installCommands;
module.exports.addCommandsToPath = addCommandsToPath;
module.exports.removeCommandsFromPath = removeCommandsFromPath;
module.exports.installContextMenu = installContextMenu;
module.exports.uninstallContextMenu = uninstallContextMenu;
module.exports.spawnPowershell = spawnPowershell;
module.exports.handleSquirrelStartupEvent = handleSquirrelStartupEvent;
module.exports.setExecPath = setExecPath;
module.exports.setSystemRoot = setSystemRoot;
module.exports.getBinFolder = () => binFolder;
