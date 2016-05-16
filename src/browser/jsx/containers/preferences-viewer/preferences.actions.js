import store from '../../services/store';

/**
 * @param {string} key
 * @param {*} value
 * @returns {object}
 */
export function changePreference(key, value) {
  const oldValue = store.get(key);

  store.set(key, value);
  return {type: 'CHANGE_PREFERENCE', key, value, oldValue};
}

export default {
  changePreference
};
