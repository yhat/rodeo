/**
 * IOPUB broadcasts may be consumed by multiple components, and are not associated with any particular part of the
 * global application state.
 * @module
 */

import _ from 'lodash';
import AsciiToHtml from 'ansi-to-html';
import {send} from '../services/ipc';

const convertor = new AsciiToHtml();

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

export function addTerminalResult(data) {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.find(state.terminals, {hasFocus: true}),
      id = terminal.id;

    return dispatch({type: 'ADD_TERMINAL_RESULT', data, id});
  };
}

export function addTerminalError(ename, evalue, traceback) {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.find(state.terminals, {hasFocus: true}),
      id = terminal.id;

    traceback = traceback && _.map(traceback, str => convertor.toHtml(str)).join('<br />');

    return dispatch({type: 'ADD_TERMINAL_ERROR', ename, evalue, traceback, id});
  };
}

export function detectTerminalVariables() {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.find(state.terminals, {hasFocus: true}),
      id = terminal.id;

    return send('get_variables').then(function (variables) {
      return dispatch({type: 'VARIABLES_DETECTED', variables, id});
    }).catch(error => console.error(error));
  }
}

export function addDisplayData(data) {
  return function (dispatch, getState) {
    const state = getState(),
      terminal = _.find(state.terminals, {hasFocus: true}),
      id = terminal.id;

    return dispatch({type: 'ADD_DISPLAY_DATA', data, id});
  };
}
