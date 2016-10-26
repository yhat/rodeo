import _ from 'lodash';
import cid from '../services/cid';
import Immutable from 'seamless-immutable';
import freeTabTypes from './free-tab-group/tab-types';

function getTerminalTabGroups() {
  const bottomLeftFocusId = cid();

  return Immutable.from([
    {
      groupId: 'bottom-left',
      active: bottomLeftFocusId,
      tabs: [
        {
          contentType: 'terminal',
          icon: 'terminal',
          label: 'Console',
          id: bottomLeftFocusId,
          content: {
            fontSize: 12,
            id: cid()
          }
        }
      ]
    }
  ]);
}

function getFreeTabGroups() {
  const topRightFocusId = cid(),
    bottomRightFocusId = cid();

  return Immutable.from([
    {
      groupId: 'top-right',
      active: topRightFocusId,
      tabs: [
        _.merge(freeTabTypes.getDefaultTab('variable-viewer'), {id: topRightFocusId}),
        freeTabTypes.getDefaultTab('history-viewer'),
        freeTabTypes.getDefaultTab('terminal-viewer')
      ]
    },
    {
      groupId: 'bottom-right',
      active: bottomRightFocusId,
      tabs: [
        _.merge(freeTabTypes.getDefaultTab('file-viewer'), {id: bottomRightFocusId}),
        freeTabTypes.getDefaultTab('plot-viewer'),
        freeTabTypes.getDefaultTab('package-search-viewer')
      ]
    }
  ]);
}

function getState() {
  return {
    freeTabGroups: getFreeTabGroups(),
    terminalTabGroups: getTerminalTabGroups()
  };
}

export default {
  getState
};
