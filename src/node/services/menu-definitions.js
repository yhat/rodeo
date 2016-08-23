/**
 * todo: Somehow we need to convert this all to client-side
 */

'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  cuid = require('cuid'),
  files = require('./files'),
  jsYaml = require('js-yaml'),
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
      item.click = ipcEmitter.send.bind(ipcEmitter, 'dispatch', cuid(), clickAction);
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
  return files.readFile(path.resolve(__dirname, '..', 'menus', name + '.yml'))
    .then(jsYaml.safeLoad);
}

// let menu = Menu.buildFromTemplate(getMenuShortcutsTemplate()),
//   fileMenu = Menu.buildFromTemplate(getFileMenuTemplate()),
//   folderMenu = Menu.buildFromTemplate(getFolderMenuTemplate());

module.exports.toElectronMenuTemplate = toElectronMenuTemplate;
module.exports.getByName = getByName;
