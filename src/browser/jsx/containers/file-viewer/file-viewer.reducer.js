import _ from 'lodash';
import Immutable from 'seamless-immutable';
import cid from '../../services/cid';
import mapReducers from '../../services/map-reducers';
import fileService from '../../services/files';
import commonTabsReducers from '../../services/common-tabs-reducers';

const knownFiles = ['.py', '.sql'];

export function getInitialState() {
  return getDefault();
}

export function getDefault() {
  return Immutable({
    id: cid(),
    path: '~',
    files: [],
    showDotFiles: false
  });
}

function normalizeFile(file) {
  file.label = file.base;

  if (file.isDirectory) {
    file.expandable = true;
    file.icon = file.expanded ? 'folder-open-o' : 'folder-o';
  } else if (_.includes(knownFiles, file.ext)) {
    file.icon = 'file-o';
  } else {
    file.icon = 'file-o';
  }

  return file;
}

function setViewedPath(state, action) {
  // our view hasn't changed in the meantime
  state = state.set('path', action.path);

  if (action.files) {
    state = state.set('files', Immutable(_.map(action.files, normalizeFile)));
  } else {
    state = state.set('files', Immutable([]));
  }

  return state;
}

function selectFile(state, action) {
  const target = action.file;

  if (target && !target.isSelected) {
    state = state.set('files', Immutable(_.map(state.files, item => {
      item.isSelected = (item.filename === target.filename);
      return item;
    })));
  }

  return state;
}

function changePreference(state, action) {
  const change = action.change;

  switch (change.key) {
    case 'showDotFiles':
      return state.set('showDotFiles', change.value);
    case 'workingDirectory':
      return setViewedPath(state, {path: change.value});
    default:
      return state;
  }
}

function folderExpanded(state, action) {
  const indexPath = action.itemPath && commonTabsReducers.convertItemPathToIndexPath(state.files, action.itemPath);

  if (indexPath) {
    indexPath.unshift('files');
    state = state.updateIn(indexPath, file => {
      file = file.asMutable();

      file.expanded = true;
      file.items = _.map(action.files, normalizeFile);

      return Immutable(normalizeFile(file));
    });
  }

  return state;
}

function folderContracted(state, action) {
  const indexPath = action.itemPath && commonTabsReducers.convertItemPathToIndexPath(state.files, action.itemPath);

  if (indexPath) {
    indexPath.unshift('files');
    state = state.updateIn(indexPath, file => {
      file = file.asMutable();

      file.expanded = false;
      delete file.items;

      return Immutable(normalizeFile(file));
    });
  }

  return state;
}

function fileSystemChanged(state, action) {
  let indexPath;

  if (action.eventType === 'add') {
    // we should add a file to the parent
    const current = fileService.getIndexPath(state.files, action.path),
      parent = fileService.getParent(action.path);

    indexPath = fileService.getIndexPath(state.files, parent);

    // only if there isn't already a file by this name
    if (!current) {
      if (state.path === parent) {
        // is root
        indexPath = [];
      } else if (indexPath) {
        indexPath.push('items');
      }

      if (indexPath) {
        indexPath.unshift('files');
        state = state.updateIn(indexPath, items => {
          items = items && items.asMutable();

          if (items) {
            items.push(normalizeFile(action.details));
          }

          return Immutable(items);
        });
      }
    }
  } else if (action.eventType === 'change') {
    // we should update the details of the file
    indexPath = fileService.getIndexPath(state.files, action.path);
  } else if (action.eventType === 'unlink') {
    indexPath = fileService.getIndexPath(state.files, action.path);

    if (indexPath) {
      indexPath.unshift('files');
      state = state.updateIn(indexPath.slice(0, -1), items => {
        items = items.asMutable();

        items.splice(_.last(indexPath), 1);

        return Immutable(items);
      });
    }
  }

  console.log('fileSystemChanged', action, indexPath);
  return state;
}

export default mapReducers({
  SET_VIEWED_PATH: setViewedPath,
  LIST_VIEWED_FILES: setViewedPath,
  SELECT_VIEWED_FILE: selectFile,
  FILE_VIEWER_FOLDER_EXPANDED: folderExpanded,
  FILE_VIEWER_FOLDER_CONTRACTED: folderContracted,
  PREFERENCE_CHANGE_SAVED: changePreference,
  FILE_SYSTEM_CHANGED: fileSystemChanged
}, getInitialState());
