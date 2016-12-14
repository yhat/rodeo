import applicationActions from '../actions/application';
import {local} from '../services/store';
import registration from '../services/registration';
import modalDialogActions from '../containers/modal-dialog-viewer/modal-dialog.actions';

function showAboutRodeo() {
  return modalDialogActions.add('aboutRodeo');
}

function showAboutStickers() {
  return modalDialogActions.add('aboutStickers');
}

function showPreferences() {
  return modalDialogActions.add('preferences');
}

function showAcknowledgements() {
  return modalDialogActions.add('acknowledgements');
}

function showRegisterRodeo() {
  return function (dispatch) {
    if (registration.shouldShowDialog()) {
      registration.rememberShowedDialog();
      dispatch(modalDialogActions.add('registerRodeo'));
    }
  };
}

function showAskQuit() {
  if (local.get('askQuit') === false) {
    return applicationActions.quit();
  }

  return modalDialogActions.add('askQuit');
}

export default {
  showAboutRodeo,
  showAboutStickers,
  showAcknowledgements,
  showAskQuit,
  showPreferences,
  showRegisterRodeo
};
