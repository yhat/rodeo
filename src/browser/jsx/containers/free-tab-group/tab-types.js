import _ from 'lodash';
import cid from '../../services/cid';
import {getDefault as getFileViewerDefault} from '../file-viewer/file-viewer.reducer';

const defaultTabTypes = {
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
  console.log('getDefaultTab1', contentType);

  let tab = defaultTabTypes[contentType];

  if (_.isFunction(tab)) {
    tab = tab();
    tab.contentType = contentType;
  }

  console.log('getDefaultTab2', contentType, tab);

  return tab;
}

export default {
  getDefaultTab
};
