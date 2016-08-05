'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  files = require('../files'),
  path = require('path'),
  win32System = require('../win32/system');

function getBinFolder(execPath) {
  return path.resolve(execPath, '..', 'bin');
}

/**
 * @param {string} appCommandName  The command that will run the app, i.e., rodeo.cmd, rodeo.sh
 * @param {string} execPath  Location of the current executable
 * @returns {Promise}
 */
function installCommands(appCommandName, execPath) {
  const appFolder = path.resolve(execPath, '..'),
    binFolder = getBinFolder(execPath),
    rodeoCommandPath = path.join(binFolder, appCommandName + '.cmd'),
    relativeRodeoPath = path.relative(binFolder, path.join(appFolder, 'resources', 'cli', appCommandName + '.cmd')),
    rodeoCommand = `@echo off\r\n\"%~dp0\\${relativeRodeoPath}\" %*`,
    rodeoShCommandPath = path.join(binFolder, 'rodeo'),
    relativeRodeoShPath = path.relative(binFolder, path.join(appFolder, 'resources', 'cli', appCommandName + '.sh')),
    rodeoShCommand = `#!/bin/sh\r\n\"$(dirname \"$0\")/${relativeRodeoShPath.replace(/\\/g, '/')}\" \"$@\"\r\necho`;

  return bluebird.all([
    files.writeFile(rodeoCommandPath, rodeoCommand),
    files.writeFile(rodeoShCommandPath, rodeoShCommand)
  ]);
}

/**
 * @param {string} appCommandName  The command that will run the app, i.e., rodeo.cmd, rodeo.sh
 * @param {string} execPath  Location of the current executable
 * @param {string} [systemRoot]
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 *
 * @example removeFromPath('Rodeo', process.execPath, process.env.SystemRoot);
 */
function addToPath(appCommandName, execPath, systemRoot) {
  return installCommands(appCommandName, execPath)
    .then(() => win32System.getPath(systemRoot))
    .then(function (pathEnv) {
      const pathSegments = pathEnv.split(/;+/).filter(_.identity),
        binFolder = getBinFolder(execPath);

      if (pathSegments.indexOf(binFolder) === -1) {
        pathSegments.push(binFolder);

        return win32System.spawnSetx(['Path', pathSegments.join(';')], systemRoot);
      }
    });
}

/**
 * @param {string} execPath  Location of the current executable
 * @param {string} [systemRoot]
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 *
 * @example removeFromPath(process.execPath, process.env.SystemRoot);
 */
function removeFromPath(execPath, systemRoot) {
  const binFolder = getBinFolder(execPath);

  return win32System.getPath(systemRoot)
    .then(pathEnv => {
      const pathSegments = pathEnv.split(/;+/)
          .filter(pathSegment => pathSegment && pathSegment !== binFolder),
        newPathEnv = pathSegments.join(';');

      if (pathEnv !== newPathEnv) {
        return win32System.spawnSetx(['Path', newPathEnv], systemRoot);
      }
    });
}

module.exports.addToPath = addToPath;
module.exports.removeFromPath = removeFromPath;
