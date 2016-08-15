import _ from 'lodash';
import {local} from '../../services/store';
import kernel from '../../actions/kernel';
import ipc from 'ipc';
import clientDiscovery from '../../services/client-discovery';

/**
 * @returns {function}
 */
function save() {
  return function (dispatch, getState) {
    const preferences = getState().preferences,
      changes = preferences.changes;

    // only save if there are no invalid entries
    if (preferences.canSave) {
      _.each(changes, function (change) {
        local.set(change.key, change.value);
        dispatch({type: 'PREFERENCE_CHANGE_SAVED', change});
      });

      // only after all changes
      if (_.some(changes, change => _.includes(['pythonCmd', 'workingDirectory'], change.key))) {
        dispatch(kernel.restart());
      }
    }
  };
}

/**
 * @param {{key: string, value: string, type: string}} change
 * @returns {function}
 */
function add(change) {
  return function (dispatch) {
    if (change.type === 'pythonCmd') {
      // check the kernel that command points to
      change.state = 'validating';
      clientDiscovery.checkKernel({cmd: change.value}).then(function (result) {
        change.checkKernel = result;

        const errors = _.get(result, 'errors');

        if (errors && errors.length) {
          change.state = 'invalid';
        } else {
          change.state = 'valid';
        }

        dispatch({type: 'PREFERENCE_CHANGE_DETAIL_ADDED', change});
      }).catch(function (error) {
        console.error(__filename, 'add', 'checkKernel', error);
      });
    } else if (change.type === 'folder') {
      // check the kernel that command points to
      change.state = 'validating';
      ipc.send('fileStats', change.value).then(function (result) {
        if (result.isDirectory) {
          change.state = 'valid';
        } else {
          result.errors = [new Error('Not a directory')];
          change.state = 'invalid';
        }
        change.fileStats = result;

        dispatch({type: 'PREFERENCE_CHANGE_DETAIL_ADDED', change});
      }).catch(function (error) {
        change.state = 'invalid';
        change.fileStats = {errors: [error]};
        dispatch({type: 'PREFERENCE_CHANGE_DETAIL_ADDED', change});
      });
    }

    // immediate feedback, because typing can be fast
    return dispatch({type: 'PREFERENCE_CHANGE_ADDED', change});
  };
}

function selectFile(change) {
  return function (dispatch) {
    return ipc.send('openDialog', {
      properties: ['openFile']
    }).then(function (fileList) {
      change = _.clone(change);
      change.value = _.head(fileList);
      return dispatch(add(change));
    }).catch(error => console.error(error));
  };
}

function selectFolder(change) {
  return function (dispatch) {
    return ipc.send('openDialog', {
      properties: ['openDirectory']
    }).then(function (fileList) {
      change = _.clone(change);
      change.value = _.head(fileList);
      return dispatch(add(change));
    }).catch(error => console.error(error));
  };
}

/**
 *
 * @param {string} active
 * @returns {function}
 */
function selectTab(active) {
  return function (dispatch, getState) {
    const preferences = getState().preferences;

    if (_.size(preferences.changes) === 0) {
      dispatch({type: 'PREFERENCE_ACTIVE_TAB_CHANGED', active});
    }
  };
}

/**
 * @returns {{type: string}}
 */
function cancelAll() {
  return {type: 'PREFERENCE_CANCEL_ALL_CHANGES'};
}

export default {
  add,
  cancelAll,
  save,
  selectFile,
  selectFolder,
  selectTab
};
