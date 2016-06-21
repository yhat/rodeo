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
 * @param {object} data
 * @returns {Promise}
 */
function register(data) {
  data['rodeoId'] = store.get('userId');

  return fetch('https://www.yhat.com/rodeo/register', {method: 'POST', body: JSON.stringify(data), 'Content-Type':'application/json'}).then(function () {
    // Use a timestamp so we know _when_ they registered
    store.set(hasRegisteredKey, new Date().getTime());
  });
}

export default {
  register,
  shouldShowDialog,
  rememberShowedDialog
};
