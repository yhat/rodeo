import _ from 'lodash';
import kernel from './kernel';
import {local} from '../services/store';

/**
 * @param {[object]} changes
 * @returns {function}
 */
function savePreferenceChanges(changes) {
  // save the actual changes _immediately_ to ban race conditions
  _.each(changes, change => local.set(change.key, change.value));

  return function (dispatch) {
    // notify everyone of the changes that have _already happened_
    _.each(changes, change => dispatch({type: 'PREFERENCE_CHANGE_SAVED', change, meta: {track: true}}));

    // restart kernel only after all changes were announced, and only once
    if (_.some(changes, change => _.includes(['pythonCmd', 'workingDirectory'], change.key))) {
      dispatch(kernel.restart());
    }
  };
}

export default {
  savePreferenceChanges
};
