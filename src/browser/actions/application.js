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
  track({category: 'application', action: 'toggle_dev_tools'});
  return function (dispatch) {
    return applicationControl.toggleDevTools().then(function () {
      // maybe some visual artifact?  no?  maybe a bolt of lightning?
    }).catch(error => dispatch(errorCaught(error)));
  };
}

function checkForUpdates() {
  track({category: 'application', action: 'check_for_updates'});
  return function (dispatch) {
    dispatch({type: 'CHECKING_FOR_UPDATE'});

    return applicationControl.checkForUpdates().then(function (result) {
      if (result === 'update-available') {
        dispatch({type: 'CHECKED_FOR_UPDATE_DOWNLOAD_AVAILABLE'});
      } else {
        dispatch({type: 'CHECKED_FOR_UPDATE_DOWNLOAD_NOT_AVAILABLE', result});
      }
    }).catch(function (error) {
      dispatch({type: 'CHECK_FOR_UPDATE_FAILED', error});
    });
  };
}

function quitAndInstallUpdates() {
  track({category: 'application', action: 'quit_and_install_updates'});
  return function (dispatch) {
    return applicationControl.quitAndInstall()
      .catch(error => dispatch(errorCaught(error)));
  };
}

export function errorCaught(error) {
  track({category: 'application', action: 'error_caught'});
  /* eslint no-console: 0 */
  console.error(error);
  return {type: 'ERROR_CAUGHT', error};
}

export default {
  checkForUpdates,
  errorCaught,
  quit,
  quitAndInstallUpdates,
  toggleDevTools
};
