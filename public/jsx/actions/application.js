import * as ipc from '../services/ipc';

export function quit(dispatch) {
  
  // probably save a bunch of stuff here to localStorage
  
  
  // probably dim the screen to make it solemn
  dispatch({type: 'QUITING'});
  
  // probably ask whether to save files here
  
  
  // actually quit
  return ipc.send('quit').then(function () {
    // maybe some visual artifact?
    dispatch({type: 'QUIT'});
  }).catch(function (error) {
    console.error('errroror', error);
  });
}

export function toogleDevTools(dispatch) {
  return ipc.send('toggle_dev_tools').then(function () {
    // maybe some visual artifact?  no?  maybe a bolt of lightning?
  }).catch(function (error) {
    console.error('errroror', error);
  });
}

export function checkForUpdates() {
  dispatch({type: 'CHECKING_FOR_APPLICATION_UPDATES'});

  return ipc.send('check_for_updates').then(function () {
    dispatch({type: 'NO_APPLICATION_UPDATES'});
  }).catch(function (error) {
    console.error('errroror', error);
  });
}
