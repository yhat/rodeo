import _ from 'lodash';
import ipc from 'ipc';
import {local} from '../../services/store';
import freeTabGroupAction from '../free-tab-group/free-tab-group.actions';

function openActivePlot() {
  return {type: 'OPEN_ACTIVE_PLOT'};
}

function focus(plot) {
  return {type: 'FOCUS_PLOT', plot};
}

function remove(plot) {
  return {type: 'REMOVE_PLOT', plot};
}

function save(plot) {
  return function () {
    // copy file somewhere else
    if (plot.data) {
      const data = plot.data,
        defaultPath = local.get('workingDirectory') || '~';

      if (data['text/html']) {
        return ipc.send('saveDialog', {
          defaultPath,
          filters: [{name: 'html', extensions: ['html']}]
        }).then(function (filename) {
          if (!_.includes(filename, '.')) {
            filename += '.html';
          }

          return ipc.send('savePlot', data['text/html'], filename);
        }).catch(error => console.error(error));
      } else if (data['image/png']) {
        return ipc.send('saveDialog', {
          defaultPath,
          filters: [{name: 'png', extensions: ['png']}]
        }).then(function (filename) {
          if (!_.includes(filename, '.')) {
            filename += '.png';
          }

          return ipc.send('savePlot', data['image/png'], filename);
        }).catch(error => console.error(error));
      } else if (data['image/svg']) {
        return ipc.send('saveDialog', {
          defaultPath,
          filters: [{name: 'svg', extensions: ['svg']}]
        }).then(function (filename) {
          if (!_.includes(filename, '.')) {
            filename += '.svg';
          }

          return ipc.send('savePlot', data['image/svg'], filename);
        }).catch(error => console.error(error));
      }
    }
  };
}

export default {
  focus,
  remove,
  save,
  openActivePlot
};
