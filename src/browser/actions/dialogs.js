import registration from '../services/registration';
import {local} from '../services/store';
import applicationActions from '../actions/application';

function showAboutRodeo() {
  const type = 'ADD_MODAL_DIALOG',
    contentType = 'ABOUT_RODEO';

  return {type, contentType};
}

function showAboutStickers() {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'ABOUT_STICKERS', title: 'Stickers'};
}

function showPreferences() {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'PREFERENCES', title: 'Preferences'};
}

function showAcknowledgements() {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'ACKNOWLEDGEMENTS', title: 'Acknowledgements'};
}

function showNotification(content) {
  return {type: 'ADD_MODAL_DIALOG', contentType: 'MARKED', content, title: 'Notification'};
}

function showRegisterRodeo(content) {
  return function (dispatch) {
    if (registration.shouldShowDialog()) {
      registration.rememberShowedDialog();
      dispatch({type: 'ADD_MODAL_DIALOG', contentType: 'REGISTER_RODEO', content, title: 'Register'});
    }
  };
}

function showAskQuit() {
  if (local.get('askQuit') === false) {
    return applicationActions.quit();
  }
  return {type: 'ADD_MODAL_DIALOG', contentType: 'ASK_QUIT'};
}

export default {
  showAboutRodeo,
  showAboutStickers,
  showAcknowledgements,
  showAskQuit,
  showPreferences,
  showNotification,
  showRegisterRodeo
};
