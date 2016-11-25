/**
 * todo: Somehow we need to convert this all to client-side
 */

'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  browserWindows = require('./browser-windows'),
  cuid = require('cuid'),
  files = require('./files'),
  jsYaml = require('js-yaml'),
  log = require('./log').asInternal(__filename),
  path = require('path'),
  util = require('util');

/**
 * @param {EventEmitter} ipcEmitter
 * @param {object} definition
 * @returns {Array}
 */
function convertMenu(ipcEmitter, definition) {
  return _.map(definition, function (itemDefinition) {
    const clickAction = itemDefinition.click,
      clickActionType = clickAction && clickAction.type,
      submenu = itemDefinition.submenu,
      item = _.pickBy(itemDefinition, _.isString); // clone all strings

    if (_.isArray(submenu)) {
      item.submenu = convertMenu(ipcEmitter, submenu);
    } else if (submenu) {
      throw new Error('Bad menu configuration: ' + util.inspect(itemDefinition));
    }

    if (_.isString(clickActionType)) {
      item.click = function (item, focusedWindow) {
        const args = ['dispatch', cuid(), clickAction],
          windowName = browserWindows.getNameOfWindow(focusedWindow);

        if (windowName) {
          args.push(windowName);
        }

        log('info', 'menu clicked', args);

        ipcEmitter.send.apply(ipcEmitter, args);
      };
    }

    return item;
  });
}

/**
 * @param {electron.ipcMain} ipcEmitter
 * @param {object} definition
 * @returns {Array}
 */
function toElectronMenuTemplate(ipcEmitter, definition) {
  return bluebird.try(function () {
    return convertMenu(ipcEmitter, definition);
  });
}

function getByName(name) {
  return bluebird.resolve(files.getInternalYAMLFileSafeSync(path.resolve(__dirname, '..', 'menus', name + '.yml')));
}

// let menu = Menu.buildFromTemplate(getMenuShortcutsTemplate()),
//   fileMenu = Menu.buildFromTemplate(getFileMenuTemplate()),
//   folderMenu = Menu.buildFromTemplate(getFolderMenuTemplate());

module.exports.toElectronMenuTemplate = toElectronMenuTemplate;
module.exports.getByName = getByName;
