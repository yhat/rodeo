import _ from 'lodash';
import store from '../../services/store';
import kernel from '../../actions/kernel';

/**
 * @param {object} item
 * @param {*} value
 * @returns {object}
 */
export function changePreference(item, value) {
  return function (dispatch) {
    const key = item.key,
      oldValue = store.get(key);

    console.log('changed', key, 'from', oldValue, 'to', value);

    store.set(key, value);

    dispatch({type: 'CHANGE_PREFERENCE', key, value, oldValue});

    console.log('item', item, 'item.change', item.change);

    if (item && _.isArray(item.change) && _.includes(item.change, 'restartPython')) {
      return dispatch(kernel.restart());
    }
    return Promise.resolve();
  };
}

export default {
  changePreference
};
