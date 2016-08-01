/**
 * @see https://github.com/atom/atom/blob/32a1d21a0debe14f159b3cbf945827d4fb7bdf30/src/browser/squirrel-update.coffee#L227
 */

'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  processes = require('./processes'),
  path = require('path'),
  os = require('os'),
  files = require('./files'),
  packageName = 'rodeo',
  appName = 'Rodeo',
  appFolder = path.resolve(process.execPath, '..'),
  rootRodeoFolder = path.resolve(appFolder, '..'),
  binFolder = path.join(rootRodeoFolder, 'bin'),
  updateDotExe = path.join(rootRodeoFolder, 'Update.exe'),
  exeName = path.basename(process.execPath),
  fileKeyPath = `HKCU\\Software\\Classes\\*\\shell\\${appName}`,
  directoryKeyPath = `HKCU\\Software\\Classes\\directory\\shell\\${appName}`,
  backgroundKeyPath = `HKCU\\Software\\Classes\\directory\\background\\shell\\${appName}`,
  applicationsKeyPath = `HKCU\\Software\\Classes\\Applications\\${packageName}.exe`;

let system32Path, regPath, powershellPath, setxPath;

if (process.env.SystemRoot) {
  system32Path = path.join(process.env.SystemRoot, 'System32');
  regPath = path.join(system32Path, 'reg.exe');
  powershellPath = path.join(system32Path, 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  setxPath = path.join(system32Path, 'setx.exe');
} else {
  regPath = 'reg.exe';
  powershellPath = 'powershell.exe';
  setxPath = 'setx.exe';
}

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
  return process.exec(powershellPath, args);
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
    `\"${process.execPath}\" \"%1\"`
  ];

  return addToRegistry(args);
}

function installMenu(keyPath, arg) {
  const args = [keyPath, '/ve', '/d', `Open with ${appName}`];

  return addToRegistry(args)
    .then(() => addToRegistry([keyPath, '/v', 'Icon', '/d', `\"${process.execPath}\"`]))
    .then(() => addToRegistry([`${keyPath}\\command`, '/ve', '/d', `\"${process.execPath}\" \"${arg}\"`]));
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
  return installMenu(fileKeyPath, '%1')
    .then(() => installMenu(directoryKeyPath, '%1'))
    .then(() => installMenu(backgroundKeyPath, '%V'))
    .then(() => installFileHandler());
}

function uninstallContextMenu() {
  return deleteFromRegistry(fileKeyPath)
    .then(() => deleteFromRegistry(directoryKeyPath))
    .then(() => deleteFromRegistry(backgroundKeyPath))
    .then(() => deleteFromRegistry(applicationsKeyPath));
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

  return files.writeFile(atomCommandPath, atomCommand)
    .then(() => files.writeFile(atomShCommandPath, atomShCommand));
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

function handleSquirrelStartupEvent(app) {
  if (process.platform !== 'win32') {
    return bluebird.resolve(false);
  }

  const squirrelCommand = process.argv[1];

  return bluebird.try(function () {
    switch (squirrelCommand) {
      case '--squirrel-install':
        return createShortcuts()
          .then(installContextMenu)
          .then(addCommandsToPath)
          .then(() => app.quit())
          .returns(true);
      case '--squirrel-updated':
        return updateShortcuts()
          .then(installContextMenu)
          .then(addCommandsToPath)
          .then(() => app.quit())
          .returns(true);
      case '--squirrel-uninstall':
        return removeShortcuts()
          .then(uninstallContextMenu)
          .then(removeCommandsFromPath)
          .then(() => app.quit())
          .returns(true);
      case '--squirrel-obsolete':
        app.quit();
        return true;
      default:
        return false;
    }
  });
}

module.exports.handleSquirrelStartupEvent = handleSquirrelStartupEvent;
