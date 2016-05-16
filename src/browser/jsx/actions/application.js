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
    }).catch(function (error) {
      console.error(error);
    });
  };
}

export function toggleDevTools() {
  return function () {
    return ipc.send('toggleDevTools').then(function () {
      // maybe some visual artifact?  no?  maybe a bolt of lightning?
    }).catch(function (error) {
      console.error(error);
    });
  };
}

export function checkForUpdates() {
  return function (dispatch) {
    dispatch({type: 'CHECKING_FOR_APPLICATION_UPDATES'});

    return ipc.send('checkForUpdates').then(function () {
      dispatch({type: 'NO_APPLICATION_UPDATES'});
    }).catch(function (error) {
      console.error(error);
    });
  };
}

export default {
  quit,
  toggleDevTools,
  checkForUpdates
};
