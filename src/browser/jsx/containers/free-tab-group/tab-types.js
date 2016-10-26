import _ from 'lodash';
import cid from '../../services/cid';
import {local} from '../../services/store';
import {getDefault as getFileViewerDefault} from '../file-viewer/file-viewer.reducer';

const defaultTabTypes = {
  'ace-pane': () => {
    const item = {
      label: 'New File',
      contentType: 'ace-pane',
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
  'file-viewer': () => ({
    icon: 'file-text-o',
    label: 'Files',
    id: cid(),
    content: getFileViewerDefault()
  }),
  'history-viewer': () => ({
    icon: 'history',
    label: 'History',
    id: cid(),
    content: {
      history: []
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
  'terminal-viewer': () => ({
    icon: 'terminal',
    label: 'Terminal',
    id: cid(),
    content: {}
  }),
  'variable-table-viewer': () => ({
    icon: 'table',
    label: 'DataFrame',
    id: cid(),
    closeable: true,
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
  }

  return tab;
}

export default {
  getDefaultTab
};
