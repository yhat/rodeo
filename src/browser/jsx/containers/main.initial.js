import _ from 'lodash';
import cid from '../services/cid';
import Immutable from 'seamless-immutable';
import freeTabTypes from './free-tab-group/tab-types';

function getFreeTabGroups() {
  const bottomLeftFocusId = cid(),
    topRightFocusId = cid(),
    bottomRightFocusId = cid();

  return Immutable.from([
    {
      groupId: 'bottom-left',
      active: bottomLeftFocusId,
      tabs: [
        _.merge(freeTabTypes.getDefaultTab('document-terminal-viewer'), {id: bottomLeftFocusId, lastFocused: new Date().getTime()}),
      ]
    },
    {
      groupId: 'top-right',
      active: topRightFocusId,
      tabs: [
        _.merge(freeTabTypes.getDefaultTab('variable-viewer'), {id: topRightFocusId, lastFocused: new Date().getTime()}),
        freeTabTypes.getDefaultTab('global-history-viewer')
        // freeTabTypes.getDefaultTab('block-terminal-viewer') // disable until better
      ]
    },
    {
      groupId: 'bottom-right',
      active: bottomRightFocusId,
      tabs: [
        _.merge(freeTabTypes.getDefaultTab('file-viewer'), {id: bottomRightFocusId, lastFocused: new Date().getTime()}),
        freeTabTypes.getDefaultTab('plot-viewer'),
        freeTabTypes.getDefaultTab('package-search-viewer')
      ]
    }
  ]);
}

function getState() {
  return {
    freeTabGroups: getFreeTabGroups()
  };
}

export default {
  getState
};
