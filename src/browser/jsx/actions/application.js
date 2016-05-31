/**
 * Application-level actions that are no associated with any particular component
 * @module
 */

import * as ipc from '../services/ipc';

export function quit() {
  return function (dispatch) {
    // probably save a bunch of stuff here to localStorage

    // probably dim the screen to make it solemn
    dispatch({type: 'QUITING'});

    // probably ask whether to save files here

    // actually quit
    return ipc.send('quitApplication').then(function () {
      // maybe some visual artifact?
      dispatch({type: 'QUIT'});
    }).catch(error => dispatch(errorCaught(error)));
  };
}

export function toggleDevTools() {
  return function (dispatch) {
    return ipc.send('toggleDevTools').then(function () {
      // maybe some visual artifact?  no?  maybe a bolt of lightning?
    }).catch(error => dispatch(errorCaught(error)));
  };
}

export function checkForUpdates() {
  return function (dispatch) {
    dispatch({type: 'CHECKING_FOR_APPLICATION_UPDATES'});

    return ipc.send('checkForUpdates').then(function () {
      dispatch({type: 'NO_APPLICATION_UPDATES'});
    }).catch(error => dispatch(errorCaught(error)));
  };
}

export function quitAndInstallUpdates() {
  return function (dispatch) {
    return ipc.send('quitAndInstall').then(function () {
      dispatch({type: 'QUITING_TO_INSTALL_UPDATES'});
    }).catch(error => dispatch(errorCaught(error)));
  };
}

export function errorCaught(error) {
  /* eslint no-console: 0 */
  console.error(error);
  return {type: 'ERROR_CAUGHT', error};
}

export default {
  errorCaught,
  quit,
  toggleDevTools,
  checkForUpdates,
  quitAndInstallUpdates
};
