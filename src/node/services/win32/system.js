'use strict';

import _ from 'lodash';
import path from 'path';
import processes from '../processes';

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
 * @param {[string]} args
 * @param {string} [systemRoot]
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 */
function spawnSetx(args, systemRoot) {
  return processes.exec(getSetXPath(systemRoot), args);
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
 * @param {string} systemRoot
 * @returns {Promise}
 */
function getFreshEnv(systemRoot) {
  const cmd = 'Start-Process -NoNewWindow -UseNewEnvironment -Wait cmd -ArgumentList "/C SET"; [Environment]::Exit(0)';

  return spawnPowershell([cmd], systemRoot).then(function (result) {
    const lines = result.stdout.split('\n'),
      splitLimit = 2;

    return _.reduce(lines, (env, line) => {
      const split = line.split('=', splitLimit);

      if (split.length === splitLimit) {
        env[split[0]] = split[1].trim();
      }

      return env;
    }, {});
  });
}

/**
 * @returns {Promise<string>}
 */
function getDefaultEnv() {
  return processes.exec('SET')
    .then(function (result) {
      const lines = result.stdout.split('\n'),
        splitLimit = 2;

      return _.reduce(lines, (env, line) => {
        const split = line.split('=', splitLimit);

        if (split.length === splitLimit) {
          env[split[0]] = split[1].trim();
        }

        return env;
      }, {});
    });
}

module.exports.spawnSetx = spawnSetx;
module.exports.spawnPowershell = spawnPowershell;
module.exports.getPath = getPath;
module.exports.getFreshEnv = getFreshEnv;
module.exports.getDefaultEnv = getDefaultEnv;

module.exports.getEnv = getFreshEnv;
