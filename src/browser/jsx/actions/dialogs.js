import clientDiscovery from '../services/client-discovery';
import {errorCaught} from './application';
import store from '../services/store';

const day = 1000 * 60 * 60 * 24;

export function showAboutRodeo() {
  const type = 'ADD_MODAL_DIALOG',
    contentType = 'ABOUT_RODEO';

  return function (dispatch) {
    return clientDiscovery.getAppVersion()
      .then(appVersion => dispatch({type, contentType, appVersion}))
      .catch(error => dispatch(errorCaught(error)));
  };
}

export function showAboutStickers() {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'ABOUT_STICKERS'};
}

export function showPreferences() {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'PREFERENCES'};
}

export function showAcknowledgements() {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'ACKNOWLEDGEMENTS'};
}

export function showNotification(content) {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'MARKED', content};
}

export function showRegisterRodeo(content) {
  const hasRegistered = store.get('hasRegistered'),
    lastRegisterReminder = store.get('lastRegisterReminder');

  return function (dispatch) {
    if (!lastRegisterReminder || (Date.now().getTime() - new Date(lastRegisterReminder).getTime() > day)) {
      dispatch({type: 'ADD_MODAL_DIALOG', contentType: 'REGISTER_RODEO', content});
    }
  };
}

export default {
  showAboutRodeo,
  showAboutStickers,
  showAcknowledgements,
  showPreferences,
  showNotification,
  showRegisterRodeo
};
