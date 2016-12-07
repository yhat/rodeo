import _ from 'lodash';
import browserWindows from './browser-windows';
import cuid from 'cuid/dist/node-cuid';
import electron from 'electron';
import util from 'util';

const log = require('./log').asInternal(__filename);

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
 * @param {EventEmitter} ipcEmitter
 * @param {object} applicationMenu
 */
function attachApplicationMenu(ipcEmitter, applicationMenu) {
  const Menu = electron.Menu,
    menuTemplate = convertMenu(ipcEmitter, applicationMenu);

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

module.exports.attachApplicationMenu = attachApplicationMenu;
