import _ from 'lodash';
import cid from '../services/cid';
import store from '../services/store';

function getSplitState() {
  return store.get('splitPanePositions') || {
    'split-pane-center': window.innerWidth / 2 + 'px',
    'split-pane-right': window.innerHeight / 2 + 'px',
    'split-pane-left': window.innerHeight / 2 + 'px'
  };
}

function getTerminalState() {
  return [{
    label: 'Console',
    id: cid(),
    tabId: cid(),
    hasFocus: true,
    icon: 'terminal',
    fontSize: _.toNumber(store.get('fontSize')) || 12,
    status: 'idle',
    history: []
  }];
}

function getPlotsState() {
  return [];
}

function getFileViewState() {
  const facts = store.get('systemFacts'),
    homedir = facts && facts.homedir;

  return {
    id: cid(),
    path: store.get('workingDirectory') || homedir || '~',
    files: [],
    showDotFiles: store.get('displayDotFiles') || false
  };
}

function getFreeTabGroups() {
  return [
    {
      groupId: 'top-right',
      items: [
        {
          contentType: 'variable-viewer',
          icon: 'table',
          label: 'Environment',
          tabId: cid(),
          id: cid()
        },
        {
          contentType: 'history-viewer',
          icon: 'history',
          label: 'History',
          tabId: cid(),
          id: cid()
        }
      ]
    },
    {
      groupId: 'bottom-right',
      items: [
        {
          contentType: 'file-viewer',
          icon: 'file-text-o',
          label: 'Files',
          tabId: cid(),
          id: cid()
        },
        {
          contentType: 'plot-viewer',
          icon: 'bar-chart',
          label: 'Plots',
          tabId: cid(),
          id: cid()
        },
        {
          contentType: 'package-viewer',
          icon: 'archive',
          label: 'Packages',
          tabId: cid(),
          id: cid()
        }
      ]
    }
  ];
}

function getState() {
  return {
    splitPanes: getSplitState(),
    terminals: getTerminalState(),
    plots: getPlotsState(),
    fileView: getFileViewState(),
    freeTabGroups: getFreeTabGroups()
  };
}

export default {
  getState
};
