import _ from 'lodash';
import cid from '../../services/cid';
import * as store from '../../services/store';
import mapReducers from '../../services/map-reducers';

const initialState = getDefault();

function getDefault() {
  const facts = store.get('systemFacts'),
    homedir = facts && facts.homedir;

  return {
    id: cid(),
    path: store.get('workingDirectory') || homedir || '~',
    files: []
  };
}

function setFileList(state, action) {
  state = _.clone(state);
  state.files = action.files;
  state.path = action.path;

  return state;
}

function selectFile(state, action) {
  const target = action.file;

  if (target && !target.isSelected) {
    state = _.clone(state);
    state.files = _.map(state.files, item => {
      item.isSelected = (item.filename === target.filename);
      return item;
    });
  }

  return state;
}

export default mapReducers({
  LIST_VIEWED_FILES: setFileList,
  SELECT_VIEWED_FILE: selectFile
}, initialState);
