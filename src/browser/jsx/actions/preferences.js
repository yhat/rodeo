import _ from 'lodash';
import kernel from './kernel';
import {local} from '../services/store';

/**
 * @param {[object]} changes
 * @returns {function}
 */
function savePreferenceChanges(changes) {
  return function (dispatch) {
    console.log('HEY!1', arguments);
    _.each(changes, function (change) {
      console.log('HEY!3', arguments);
      local.set(change.key, change.value);
      dispatch({type: 'PREFERENCE_CHANGE_SAVED', change});
    });

    // only after all changes were announced, and only once
    if (_.some(changes, change => _.includes(['pythonCmd', 'workingDirectory'], change.key))) {
      console.log('HEY!2', arguments);
      dispatch(kernel.restart());
    }
  };
}

export default {
  savePreferenceChanges
};
