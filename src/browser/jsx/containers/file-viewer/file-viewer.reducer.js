import _ from 'lodash';
import cid from '../../services/cid';
import mapReducers from '../../services/map-reducers';

export function getInitialState() {
  return {
    id: cid(),
    path: '~',
    files: [],
    showDotFiles: false
  };
}

function setViewedPath(state, action) {
  console.log('setViewedPath', action);

  state = _.clone(state);
  state.path = action.path;

  if (action.files) {
    state.files = action.files;
  } else {
    state.files = [];
  }

  return state;
}

function setFileList(state, action) {
  console.log('setFileList', action);

  // Async means multiple file lists could be coming.
  // Only accept the one that matches what we're current viewing.
  if (state.path === action.path) {
    state = _.clone(state);
    state.files = action.files;
  }

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

  _.set(state, propertyName, value);

  return state;
}

function changePreference(state, action) {
  const change = action.change;

  switch (change.key) {
    case 'showDotFiles': return changeProperty(state, 'showDotFiles', change.value);
    case 'workingDirectory': return setViewedPath(state, {path: change.value});
    default: return state;
  }
}

export default mapReducers({
  SET_VIEWED_PATH: setViewedPath,
  LIST_VIEWED_FILES: setFileList,
  SELECT_VIEWED_FILE: selectFile,
  PREFERENCE_CHANGE_SAVED: changePreference
}, getInitialState());
