import clientDiscovery from '../services/client-discovery';
import {errorCaught} from './application';
import registration from '../services/registration';

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
  return function (dispatch) {
    if (registration.shouldShowDialog()) {
      registration.rememberShowedDialog();
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
