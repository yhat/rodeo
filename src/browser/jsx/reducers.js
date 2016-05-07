import { combineReducers } from 'redux';
import acePanes from 'components/ace-pane/ace-pane.reducer.js';
import splitPanes from 'components/split-pane/split-pane.reducer.js';
import terminals from 'components/terminal/terminal.reducer.js';
import plots from 'components/plot-viewer/plot-viewer.reducer.js';
import fileView from 'components/file-viewer/file-viewer.reducer.js';

export default combineReducers({
  acePanes,
  splitPanes,
  terminals,
  plots,
  fileView
});