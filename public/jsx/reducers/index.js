import { combineReducers } from 'redux';
import acePanes from '../components/ace-pane/ace-pane.reducer';
import splitPanes from '../components/split-pane/split-pane.reducer';
import terminals from '../components/terminal/terminal.reducer';
import plots from '../components/plot-viewer/plot-viewer.reducer';
import fileView from '../components/file-viewer/file-viewer.reducer';

export default combineReducers({
  acePanes,
  splitPanes,
  terminals,
  plots,
  fileView
});