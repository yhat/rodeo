import _ from 'lodash';
import bluebird from 'bluebird';
import browserWindows from './browser-windows';

const log = require('./log').asInternal(__filename);

function getTabs() {
  const windowNames = browserWindows.getWindowNames();

  return bluebird.all(_.map(windowNames, name => {
    return browserWindows.send(name, 'getTabs').catch(error => log('error', error));
  }));
}

module.exports.getTabs = getTabs;
