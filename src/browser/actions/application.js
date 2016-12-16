/**
 * Application-level actions that are no associated with any particular component
 * @module
 */

import applicationControl from '../services/application-control';
import {local} from '../services/store';
import track from '../services/track';

function quit() {
  track({category: 'application', action: 'quit', sessionControl: 'end'});
  return function (dispatch, getState) {
    // probably save a bunch of stuff here to localStorage
    local.set('lastSavedAppState', getState());

    // probably dim the screen to make it solemn
    dispatch({type: 'QUITING'});

    // probably ask whether to save files here

    // actually quit
    return applicationControl.quit().then(function () {
      // maybe some visual artifact?
      dispatch({type: 'QUIT'});
    }).catch(error => dispatch(errorCaught(error)));
  };
}

function toggleDevTools() {
  return function (dispatch) {
    return applicationControl.toggleDevTools().then(function () {
      // maybe some visual artifact?  no?  maybe a bolt of lightning?
    }).catch(error => dispatch(errorCaught(error)));
  };
}

function checkForUpdates() {
  return function (dispatch) {
    dispatch({type: 'CHECKING_FOR_UPDATE', meta: {sender: 'self'}});

    return applicationControl.checkForUpdates().then(function (result) {
      if (result === 'update-available') {
        dispatch({type: 'CHECKED_FOR_UPDATE_DOWNLOAD_AVAILABLE', meta: {sender: 'self'}});
      } else {
        dispatch({type: 'CHECKED_FOR_UPDATE_DOWNLOAD_NOT_AVAILABLE', result, meta: {sender: 'self'}});
      }
    }).catch(function (error) {
      dispatch({type: 'CHECK_FOR_UPDATE_FAILED', error, meta: {sender: 'self'}});
    });
  };
}

function quitAndInstallUpdates() {
  return function (dispatch) {
    return applicationControl.quitAndInstall()
      .catch(error => dispatch(errorCaught(error)));
  };
}

export function errorCaught(error) {
  /* eslint no-console: 0 */
  console.error(error);
  return {type: 'ERROR_CAUGHT', error, meta: {track: true, sender: 'self'}};
}

function showStartupWindow() {
  return function () {
    return applicationControl.showStartupWindow();
  };
}

export default {
  checkForUpdates,
  errorCaught,
  showStartupWindow,
  quit,
  quitAndInstallUpdates,
  toggleDevTools
};
