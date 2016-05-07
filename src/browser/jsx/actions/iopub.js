/**
 * IOPUB broadcasts may be consumed by multiple components, and are not associated with any particular part of the
 * global application state.
 * @module
 */

import _ from 'lodash';

export function setTerminalState(status) {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.find(state.terminals, {hasFocus: true}),
      id = terminal.id;

    return dispatch({type: 'TERMINAL_STATE', status, id});
  };
}

export function addTerminalExecutedInput(code) {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.find(state.terminals, {hasFocus: true}),
      id = terminal.id;

    return dispatch({type: 'ADD_TERMINAL_EXECUTED_INPUT', code, id});
  };
}

export function addTerminalText(name, text) {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.find(state.terminals, {hasFocus: true}),
      id = terminal.id;

    return dispatch({type: 'ADD_TERMINAL_TEXT', name, text, id});
  };
}

export function addDisplayData(data) {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.find(state.terminals, {hasFocus: true}),
      id = terminal.id;

    return dispatch({type: 'ADD_DISPLAY_DATA', data, id});
  };
}
