import _ from 'lodash';
import store from './store';

const minute = 1000 * 60,
  day = minute * 60 * 24,
  hasRegisteredKey = 'hasRegistered',
  lastRegisterReminderKey = 'lastRegisterReminder';

function shouldShowDialog() {
  const hasRegistered = store.get(hasRegisteredKey),
    lastRegisterReminder = store.get(lastRegisterReminderKey),
    timeSince = !!lastRegisterReminder && (Date.now() - new Date(lastRegisterReminder).getTime());

  return !hasRegistered && (!lastRegisterReminder || (timeSince > day));
}

function rememberShowedDialog() {
  store.set(lastRegisterReminderKey, new Date().getTime());
}

/**
 * @param {object} obj
 * @returns {string}
 * @throws if object contains keys that are symbols or values that are not strings. Convert them first please.
 */
function createQueryString(obj) {
  return _.map(obj, function (value, key) {
    if (!_.isString(value) || !_.isString(key)) {
      throw new Error('Expected key and value to be strings');
    }

    return encodeURIComponent(key) + '=' + encodeURIComponent(value);
  }, []).join('&');
}

/**
 * @param {object} data
 * @returns {Promise}
 */
function register(data) {
  data['rodeoId'] = store.get('userId');

  return fetch('http://yhat.com/rodeo/register?' + createQueryString(data)).then(function () {
    // Use a timestamp so we know _when_ they registered
    store.set(hasRegisteredKey, new Date().getTime());
  });
}

export default {
  register,
  shouldShowDialog,
  rememberShowedDialog
};
