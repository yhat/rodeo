'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  files = require('../files'),
  processes = require('../processes'),
  path = require('path');

/**
 * @param {string} [systemRoot]
 * @returns {string}
 */
function getPowershellPath(systemRoot) {
  if (systemRoot) {
    return path.join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  }

  return 'powershell.exe';
}

/**
 * @param {string} [systemRoot]
 * @returns {string}
 */
function getSetXPath(systemRoot) {
  if (systemRoot) {
    return path.join(systemRoot, 'System32', 'setx.exe');
  }

  return 'setx.exe';
}

/**
 * Run the powershell
 * @param {[string]} args
 * @param {string} [systemRoot]
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function spawnPowershell(args, systemRoot) {
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
  return processes.exec(getPowershellPath(systemRoot), args);
}

/**
 * @param {[string]} args
 * @param {string} [systemRoot]
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function spawnSetx(args, systemRoot) {
  return processes.exec(getSetXPath(systemRoot), args);
}

/**
 * @param {string} appCommandName  The command that will run the app, i.e., rodeo.cmd, rodeo.sh
 * @param {string} execPath  Location of the current executable
 * @returns {Promise}
 */
function installCommands(appCommandName, execPath) {
  const appFolder = path.resolve(execPath, '..'),
    binFolder = path.join(path.resolve(appFolder, '..'), 'bin'),
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
 * @param {string} [systemRoot]
 * @returns {Promise<string>}
 */
function getPath(systemRoot) {
  return spawnPowershell(['[environment]::GetEnvironmentVariable(\'Path\',\'User\')'], systemRoot)
    .then(function (result) {
      return result.stdout.replace(/^\s+|\s+$/g, '');
    });
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
    .then(() => getPath(systemRoot))
    .then(function (pathEnv) {
      const pathSegments = pathEnv.split(/;+/).filter(_.identity),
        binFolder = path.resolve(execPath, '..', '..', 'bin');

      if (pathSegments.indexOf(binFolder) === -1) {
        pathSegments.push(binFolder);

        return spawnSetx(['Path', pathSegments.join(';')], systemRoot);
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
  const binFolder = path.resolve(execPath, '..', '..', 'bin');

  return getPath(systemRoot)
    .then(pathEnv => {
      const pathSegments = pathEnv.split(/;+/)
          .filter(pathSegment => pathSegment && pathSegment !== binFolder),
        newPathEnv = pathSegments.join(';');

      if (pathEnv !== newPathEnv) {
        return spawnSetx(['Path', newPathEnv], systemRoot);
      }
    });
}

module.exports.addToPath = addToPath;
module.exports.removeFromPath = removeFromPath;
