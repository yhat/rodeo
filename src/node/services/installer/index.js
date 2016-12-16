/**
 * @see https://github.com/atom/atom/blob/32a1d21a0debe14f159b3cbf945827d4fb7bdf30/src/browser/squirrel-update.coffee#L227
 */

import _ from 'lodash';
import args from '../args';
import bluebird from 'bluebird';
import os from 'os';
import shortcuts from './shortcuts';
import commands from './commands';
import contextMenu from './context-menu';
import python from '../../kernels/python/client';

const log = require('../log').asInternal(__filename),
  argv = args.getArgv(),
  activeCommands = {
    squirrelInstall: install,
    squirrelUpdate: update,
    squirrelUninstall: uninstall,
    squirrelObsolete: obsolete
  },
  passiveCommands = {
    squirrelFirstrun: firstRun
  };

function reportError(message) {
  return function (error) {
    log('error', message, error);
  };
}

function firstRun(appName, execPath, systemRoot) {
  log('info', 'firstRunning', {appName, execPath, systemRoot});
  return bluebird.all([
    shortcuts.create(execPath).catch(reportError('failed to create shortcuts')),
    contextMenu.install(execPath, systemRoot).catch(reportError('failed to install context menu')),
    commands.addToPath(appName, execPath, systemRoot).catch(reportError('failed to add to path'))
    // python.createBuiltinKernelJson().catch(reportError('failed to add built-in kernel.json'))
  ]);
}

function install(appName, execPath, systemRoot) {
  log('info', 'installing', {appName, execPath, systemRoot});
  return bluebird.all([]);
}

function update(appName, execPath, systemRoot) {
  log('info', 'updating', {appName, execPath, systemRoot});
  return bluebird.all([
    shortcuts.update(execPath, appName, os.homedir()).catch(reportError('failed to update shortcuts')),
    contextMenu.install(execPath, systemRoot).catch(reportError('failed to install context menu')),
    commands.addToPath(appName, execPath, systemRoot).catch(reportError('failed to add to path'))
  ]);
}

function uninstall(appName, execPath, systemRoot) {
  log('info', 'uninstalling', {appName, execPath, systemRoot});
  return bluebird.all([
    shortcuts.remove(execPath).catch(reportError('failed to remove shortcuts')),
    contextMenu.uninstall(systemRoot).catch(reportError('failed to uninstall context menu')),
    commands.removeFromPath(execPath, systemRoot).catch(reportError('failed to remove from path'))
  ]);
}

function obsolete() {
  return bluebird.all([]);
}

function findFlaggedKey(map) {
  return _.findKey(map, (value, key) => !!argv[key]);
}

/**
 * Handles squirrel events if any.
 *
 * @returns {boolean} Should we quit immediate/y?
 */
function handleSquirrelStartupEvent() {
  if (process.platform !== 'win32') {
    return false;
  }

  const appName = 'Rodeo',
    execPath = process.execPath,
    systemRoot = process.env.SystemRoot,
    activeCommand = findFlaggedKey(activeCommands),
    passiveCommand = findFlaggedKey(passiveCommands);

  log('info', 'squirrel saw', {activeCommand, passiveCommand, execPath, systemRoot});

  if (activeCommand) {
    activeCommands[activeCommand](appName, execPath, systemRoot).return(true);
    return true;
  } else if (passiveCommand) {
    passiveCommands[passiveCommand](appName, execPath, systemRoot).return(false);
    return false;
  }

  return false;
}

export default {
  handleSquirrelStartupEvent
};
