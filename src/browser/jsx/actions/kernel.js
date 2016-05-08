/**
 * Kernel events can be triggered from several different components that want to interact with the underlying kernel.
 * @module
 */

import _ from 'lodash';
import { send } from '../services/ipc';
import ace from 'ace';

export function interrupt() {
  return function (dispatch) {
    dispatch({type: 'INTERRUPTING_KERNEL'});

    return send('interrupt').then(function () {
      // maybe some visual artifact?
      dispatch({type: 'INTERRUPTED_KERNEL'});
    }).catch(function (error) {
      console.error(error);
    });
  };
}

export function isBusy() {
  return {type: 'KERNEL_IS_BUSY'};
}

export function isIdle() {
  return {type: 'KERNEL_IS_IDLE'};
}

export function executeActiveFileInActiveConsole() {
  return function (dispatch, getState) {
    const state = getState(),
      focusedAce = state && _.find(state.acePanes, {hasFocus: true}),
      el = focusedAce && document.querySelector('#' + focusedAce.id),
      aceInstance = el && ace.edit(el),
      filename = focusedAce.filename,
      focusedTerminal = state && _.find(state.terminals, {hasFocus: true}),
      id = focusedTerminal.id,
      content = aceInstance && aceInstance.getSession().getValue();

    dispatch({type: 'EXECUTING', filename, id});

    send('execute', content).then(function () {
      dispatch({type: 'EXECUTED', id});
    }).catch(function (error) {
      console.error(error);
    });
  };
}

export function execute(text, id) {
  return function (dispatch) {
    dispatch({type: 'EXECUTING', text, id});

    send('execute', text).then(function () {
      dispatch({type: 'EXECUTED', text, id});
    }).catch(function (error) {
      console.error(error);
    });
  };
}

export default {
  execute,
  executeActiveFileInActiveConsole,
  isIdle,
  isBusy,
  interrupt
};
