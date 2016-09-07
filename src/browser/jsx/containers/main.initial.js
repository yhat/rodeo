import cid from '../services/cid';
import Immutable from 'seamless-immutable';
import {local} from '../services/store';

function getSplitState() {
  return local.get('splitPanePositions') || {
    'split-pane-center': window.innerWidth / 2 + 'px',
    'split-pane-right': window.innerHeight / 2 + 'px',
    'split-pane-left': window.innerHeight / 2 + 'px'
  };
}

function getFreeTabGroups() {
  const topRightFocusId = cid(),
    bottomRightFocusId = cid();

  return Immutable.from([
    {
      groupId: 'top-right',
      active: topRightFocusId,
      tabs: [
        {
          contentType: 'variable-viewer',
          icon: 'table',
          label: 'Environment',
          id: topRightFocusId
        },
        {
          contentType: 'history-viewer',
          icon: 'history',
          label: 'History',
          id: cid()
        }
      ]
    },
    {
      groupId: 'bottom-right',
      active: bottomRightFocusId,
      tabs: [
        {
          contentType: 'file-viewer',
          icon: 'file-text-o',
          label: 'Files',
          id: bottomRightFocusId
        },
        {
          contentType: 'plot-viewer',
          icon: 'bar-chart',
          label: 'Plots',
          id: cid()
        },
        {
          contentType: 'package-viewer',
          icon: 'archive',
          label: 'Packages',
          id: cid()
        },
        {
          contentType: 'package-search-viewer',
          icon: 'archive',
          label: 'Package Search',
          tabId: cid(),
          id: cid()
        }
      ]
    }
  ]);
}

function getState() {
  return {
    splitPanes: getSplitState(),
    freeTabGroups: getFreeTabGroups()
  };
}

export default {
  getState
};
