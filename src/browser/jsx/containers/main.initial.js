import cid from '../services/cid';
import Immutable from 'seamless-immutable';
import {local} from '../services/store';
import {getInitialState as getFileViewerInitialState} from './file-viewer/file-viewer.reducer';
import {getInitialState as getPlotViewerInitialState} from './plot-viewer/plot-viewer.reducer';
import {getInitialState as getPackageSearchViewerInitialState} from './package-search-viewer/package-search-viewer.reducer';

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
          id: bottomLeftFocusId
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
        {
          contentType: 'variable-viewer',
          icon: 'table',
          label: 'Environment',
          id: topRightFocusId,
          content: {}
        },
        {
          contentType: 'history-viewer',
          icon: 'history',
          label: 'History',
          id: cid(),
          content: {
            history: []
          }
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
          id: bottomRightFocusId,
          content: getFileViewerInitialState()
        },
        {
          contentType: 'plot-viewer',
          icon: 'bar-chart',
          label: 'Plots',
          id: cid(),
          content: getPlotViewerInitialState()
        },
        {
          contentType: 'package-search-viewer',
          icon: 'archive',
          label: 'Packages',
          id: cid(),
          content: getPackageSearchViewerInitialState()
        }
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
