/**
 * @see https://github.com/atom/atom/blob/32a1d21a0debe14f159b3cbf945827d4fb7bdf30/src/browser/squirrel-update.coffee#L227
 */

'use strict';

const bluebird = require('bluebird'),
  os = require('os'),
  shortcuts = require('./shortcuts'),
  commands = require('./commands'),
  contextMenu = require('./context-menu'),
  log = require('../log').asInternal(__filename);

function reportError(message) {
  return function (error) {
    log('error', {message, error});
  };
}

/**
 * Handles squirrel events if any.  Then quits if any.
 *
 * @param {electron.app} app
 * @returns {Promise<boolean>}  Are we handling squirrel events?  False if we are not.
 */
function handleSquirrelStartupEvent(app) {
  if (process.platform !== 'win32') {
    return bluebird.resolve(false);
  }

  return bluebird.try(function () {
    const appName = 'Rodeo',
      squirrelCommand = process.argv[1],
      execPath = process.execPath,
      systemRoot = process.env.SystemRoot;

    log('info', 'squirrel saw', {squirrelCommand, execPath, systemRoot});

    switch (squirrelCommand) {
      case '--squirrel-install':
        return bluebird.all([
          shortcuts.create(execPath).catch(reportError('failed to create shortcuts')),
          contextMenu.install(execPath, systemRoot).catch(reportError('failed to install context menu')),
          commands.addToPath(appName, execPath, systemRoot).catch(reportError('failed to add to path'))
        ]).finally(() => app.quit())
          .return(true);
      case '--squirrel-updated':
        return bluebird.all([
          shortcuts.update(execPath, appName, os.homedir()).catch(reportError('failed to update shortcuts')),
          contextMenu.install(execPath, systemRoot).catch(reportError('failed to install context menu')),
          commands.addToPath(appName, execPath, systemRoot).catch(reportError('failed to add to path'))
        ]).finally(() => app.quit())
          .return(true);
      case '--squirrel-uninstall':
        return bluebird.all([
          shortcuts.remove(execPath).catch(reportError('failed to remove shortcuts')),
          contextMenu.uninstall(systemRoot).catch(reportError('failed to uninstall context menu')),
          commands.removeFromPath(execPath, systemRoot).catch(reportError('failed to remove from path'))
        ]).finally(() => app.quit())
          .return(true);
      case '--squirrel-obsolete':
        app.quit();
        return true;
      default:
        return false;
    }
  });
}

module.exports.handleSquirrelStartupEvent = handleSquirrelStartupEvent;
