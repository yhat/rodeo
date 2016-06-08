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
    files: [],
    showDotFiles: store.get('displayDotFiles') || false
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

/**
 * @param {object} state
 * @param {string} propertyName
 * @param {*} value
 * @returns {object}
 */
function changeProperty(state, propertyName, value) {
  state = _.cloneDeep(state);

  console.log('file-viewer:before', state, propertyName, value);

  _.set(state, propertyName, value);

  console.log('file-viewer:after', state, propertyName, value);

  return state;
}

function changePreference(state, action) {
  switch (action.key) {
    case 'showDotFiles': return changeProperty(state, 'showDotFiles', action.value);
    default: return state;
  }
}


export default mapReducers({
  LIST_VIEWED_FILES: setFileList,
  SELECT_VIEWED_FILE: selectFile,
  CHANGE_PREFERENCE: changePreference
}, initialState);
