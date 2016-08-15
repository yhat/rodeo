import _ from 'lodash';
import bluebird from 'bluebird';
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

        if (change.type === 'python-cmd') {
          dispatch(kernel.restart());
        }
      });
    }
  };
}

function getFileStats(filePath) {
  return function () {
    ipc.send('fileStats').getFileStats(filePath)
      .then(() => console.log(__filename, 'getFileStats', arguments))
      .catch(() => console.error(__filename, 'getFileStats', arguments));
  };
}

/**
 * @param {{key: string, value: string, type: string}} change
 * @returns {{type: string, change: {key: string, value: string, type: string}}}
 */
function add(change) {
  return function (dispatch) {
    if (change.type === 'pythonCmd') {
      // check the kernel that command points to
      clientDiscovery.checkKernel({cmd: change.value}).then(function (result) {
        change.checkKernel = result;
        dispatch({type: 'PREFERENCE_CHANGE_DETAIL_ADDED', change});
      }).catch(function (error) {
        console.error(__filename, 'add', 'checkKernel', error);
      });
    } else if (change.type === 'file_select') {
      // verify file exists
    } else if (change.type === 'directory_select') {
      // verify directory exists
    }

    // immediate feedback, because typing can be fast
    return dispatch({type: 'PREFERENCE_CHANGE_ADDED', change});
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
  selectTab
};
