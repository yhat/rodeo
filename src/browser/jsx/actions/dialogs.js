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
  return {type: 'ADD_MODAL_DIALOG', contentType: 'ABOUT_STICKERS', title: 'Stickers'};
}

export function showPreferences() {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'PREFERENCES', title: 'Preferences'};
}

export function showAcknowledgements() {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'ACKNOWLEDGEMENTS', title: 'Acknowledgements'};
}

export function showNotification(content) {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'MARKED', content, title: 'Notification'};
}

export function showRegisterRodeo(content) {
  return function (dispatch) {
    if (registration.shouldShowDialog()) {
      registration.rememberShowedDialog();
      dispatch({type: 'ADD_MODAL_DIALOG', contentType: 'REGISTER_RODEO', content, title: 'Register'});
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
