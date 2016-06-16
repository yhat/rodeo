/**
 * IOPUB broadcasts may be consumed by multiple components, and are not associated with any particular part of the
 * global application state.
 * @module
 */

/**
 * @param {string} ename
 * @param {string} evalue
 * @param {[string]} traceback
 * @returns {{type: string, ename: string, evalue: string, traceback: [string]}}
 */
function errorOccurred(ename, evalue, traceback) {
  return {type: 'IOPUB_ERROR_OCCURRED', ename, evalue, traceback};
}

/**
 * @param {object} data
 * @returns {{type: string, data: object}}
 */
function dataDisplayed(data) {
  return {type: 'IOPUB_DATA_DISPLAYED', data};
}

/**
 * @param {object} data
 * @returns {{type: string, data: object}}
 */
function resultComputed(data) {
  return {type: 'IOPUB_RESULT_COMPUTED', data};
}

/**
 *
 * @param {string} name
 * @param {string} text
 * @returns {{type: string, name: string, text: string}}
 */
function dataStreamed(name, text) {
  return {type: 'IOPUB_DATA_STREAMED', name, text};
}

/**
 * @param {string} text
 * @returns {{type: string, text: string}}
 */
function inputExecuted(text) {
  return {type: 'IOPUB_EXECUTED_INPUT', text};
}

/**
 * @param {string} executionState
 * @returns {{type: string, executionState: string}}
 */
function stateChanged(executionState) {
  return {type: 'IOPUB_STATE_CHANGED', executionState};
}

function unknownEventOccurred(event) {
  return {type: 'IOPUB_UNKNOWN_EVENT_OCCURRED', event};
}

export default {
  dataDisplayed,
  dataStreamed,
  resultComputed,
  errorOccurred,
  inputExecuted,
  stateChanged,
  unknownEventOccurred
};
