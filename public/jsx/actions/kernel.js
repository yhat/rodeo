import _ from 'lodash';
import * as ipc from '../services/ipc';
import * as store from '../services/store';

export function execute(code) {
  return function (dispatch) {
    dispatch({type: 'EXECUTING'});

    ipc.send('execute', code).then(function () {
      // maybe some visual artifact?
      dispatch({type: 'EXECUTED'});
    }).catch(function (error) {
      console.error('errroror', error);
    });
  };
}

export function interrupt(dispatch, getState) {
  dispatch({type: 'INTERRUPTING_KERNEL'});

  return ipc.send('interrupt').then(function () {
    // maybe some visual artifact?
    dispatch({type: 'INTERRUPTED_KERNEL'});
  }).catch(function (error) {
    console.error('errroror', error);
  });
}

export function isBusy() {
  return {type: 'KERNEL_IS_BUSY'};
}

export function isIdle() {
  return {type: 'KERNEL_IS_IDLE'};
}