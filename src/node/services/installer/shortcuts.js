import processes from '../processes';
import path from 'path';
import files from '../files';

const updateName = 'Update.exe';

function getUpdateExe(execPath) {
  return path.resolve(execPath, '..', '..', updateName);
}

/**
 * @param {string} execPath
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 *
 * @example createShortcuts(process.execPath)
 */
function create(execPath) {
  return processes.exec(getUpdateExe(execPath), ['--createShortcut', path.basename(execPath)]);
}

/**
 * @param {string} execPath
 * @param {string} appName
 * @param {string} [homeDirectory]
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 *
 * @example updateShortcuts(process.execPath, 'Rodeo', os.homedir());
 */
function update(execPath, appName, homeDirectory) {
  if (homeDirectory) {
    const desktopShortcutPath = path.join(homeDirectory, 'Desktop', `${appName}.lnk`);

    // Check if the desktop shortcut has been previously deleted and
    // and keep it deleted if it was
    return files.exists(desktopShortcutPath)
      .then(exists => {
        return create(execPath).then(() => {
          if (!exists) {
            return files.unlink(desktopShortcutPath);
          }
        });
      });
  } else {
    return create(execPath);
  }
}

/**
 * @param {string} execPath
 * @returns {Promise.<{errors: Error[], stderr: string, stdout: string}>}
 *
 * @example removeShortcuts(process.execPath);
 */
function remove(execPath) {
  return processes.exec(getUpdateExe(execPath), ['--removeShortcut', path.basename(execPath)]);
}

module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;
