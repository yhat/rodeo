import _ from 'lodash';
import bluebird from 'bluebird';
import browserWindows from './browser-windows';

function getTabs() {
  const windowNames = browserWindows.getWindowNames();

  return bluebird.all(_.map(windowNames, name => {
    return browserWindows.send(name, 'getTabs');
  }));
}

export default {
  getTabs
};
