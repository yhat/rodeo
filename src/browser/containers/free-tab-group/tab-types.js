import _ from 'lodash';
import cid from '../../services/cid';
import {local} from '../../services/store';
import {getDefault as getFileViewerDefault} from '../file-viewer/file-viewer.reducer';

const defaultTabTypes = {
  'ace-pane': () => {
    const item = {
      label: 'New File',
      id: cid(),
      closeable: true,
      content: {
        fontSize: _.toNumber(local.get('fontSize')) || 12,
        highlightLine: true,
        keyBindings: local.get('aceKeyBindings') || 'default',
        tabSize: _.toNumber(local.get('aceTabSpaces')) || 4,
        theme: local.get('aceTheme') || 'chrome',
        useSoftTabs: local.get('aceUseSoftTabs') || true
      }
    };

    applyKnownFileTypeByFilename(item, '');

    return item;
  },
  'database-viewer': () => ({
    icon: 'database',
    label: 'Database',
    id: cid(),
    content: {
      items: [],
      showHidden: false
    }
  }),
  'document-terminal-viewer': () => ({
    icon: 'terminal',
    label: 'Terminal',
    id: cid(),
    content: {
      actives: {},
      fontSize: _.toNumber(local.get('fontSize')) || 12,
      items: [],
      lines: [''],
      cursor: {row: 0, column: 0},
      queue: [],
      responses: {},
      state: 'paused', // paused, prompt, busy, input
      promptLabel: '>>> ',
      continueLabel: '... '
    }
  }),
  'file-viewer': () => ({
    icon: 'file-text-o',
    label: 'Files',
    id: cid(),
    content: getFileViewerDefault()
  }),
  'global-history-viewer': () => ({
    icon: 'history',
    label: 'History',
    id: cid(),
    content: {
      blocks: [],
      fontSize: _.toNumber(local.get('fontSize')) || 12,
    }
  }),
  'package-search-viewer': () => ({
    icon: 'archive',
    label: 'Packages',
    id: cid(),
    content: {
      searchValue: ''
    }
  }),
  'plot-viewer': () => ({
    icon: 'bar-chart',
    label: 'Plots',
    id: cid(),
    content: {
      plots: []
    }
  }),
  'block-terminal-viewer': () => ({
    closeable: true,
    icon: 'terminal',
    label: 'Terminal',
    id: cid(),
    content: {
      blocks: [],
      lines: [''],
      cursor: {row: 0, column: 0},
      queue: [],
      state: 'paused', // paused, prompt, busy, input

    }
  }),
  'variable-table-viewer': () => ({
    closeable: true,
    icon: 'table',
    label: 'DataFrame',
    id: cid(),
    content: {}
  }),
  'variable-viewer': () => ({
    icon: 'list',
    label: 'Environment',
    id: cid(),
    content: {}
  })
};

function getDefaultTab(contentType) {
  let tab = defaultTabTypes[contentType];

  if (_.isFunction(tab)) {
    tab = tab();
    tab.contentType = contentType;
    tab.lastFocused = 0; // never focused
  }

  return tab;
}

export default {
  getDefaultTab
};
