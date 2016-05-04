import { combineReducers } from 'redux';
import acePanes from '../components/ace-pane/ace-pane.reducer';
import splitPanes from '../components/split-pane/split-pane.reducer';

export default combineReducers({
  acePanes,
  splitPanes
});