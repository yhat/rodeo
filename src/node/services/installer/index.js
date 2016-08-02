/**
 * @see https://github.com/atom/atom/blob/32a1d21a0debe14f159b3cbf945827d4fb7bdf30/src/browser/squirrel-update.coffee#L227
 */

'use strict';

const bluebird = require('bluebird'),
  os = require('os'),
  shortcuts = require('./shortcuts'),
  commands = require('./commands'),
  contextMenu = require('./context-menu');

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

    switch (squirrelCommand) {
      case '--squirrel-install':
        return bluebird.all([
          shortcuts.create(execPath),
          contextMenu.install(execPath, systemRoot),
          commands.addToPath(appName, execPath, systemRoot)
        ]).then(() => app.quit())
          .return(true);
      case '--squirrel-updated':
        return bluebird.all([
          shortcuts.update(execPath, appName, os.homedir()),
          contextMenu.install(execPath, systemRoot),
          commands.addToPath(appName, execPath, systemRoot)
        ]).then(() => app.quit())
          .return(true);
      case '--squirrel-uninstall':
        return bluebird.all([
          shortcuts.remove(execPath),
          contextMenu.uninstall(systemRoot),
          commands.removeFromPath(execPath, systemRoot)
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

module.exports.handleSquirrelStartupEvent = handleSquirrelStartupEvent;
