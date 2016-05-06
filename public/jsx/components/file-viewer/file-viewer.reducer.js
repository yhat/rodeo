import _ from 'lodash';
import cid from '../../services/cid';
import * as store from '../../services/store';

const initialState = getDefault();

function getDefault() {
  const facts = store.get('systemFacts'),
    homedir = facts && facts.homedir;

  return {
    id: cid(),
    path: store.get('workingDirectory') || homedir,
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

  console.log('selectFile', target);

  if (target && !target.isSelected) {
    state = _.clone(state);
    state.files = _.map(state.files, item => {
      item.isSelected = (item.filename === target.filename);
      return item;
    });

    console.log('state.files after', state.files);
  }

  return state;
}

export default function (state = initialState, action) {
  switch (action.type) {
    case 'LIST_VIEWED_FILES': return setFileList(state, action);
    case 'SELECT_VIEWED_FILE': return selectFile(state, action);
    default: return state;
  }
}