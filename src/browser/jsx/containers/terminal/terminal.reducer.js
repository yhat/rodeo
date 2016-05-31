import _ from 'lodash';
import $ from 'jquery';
import cid from '../../services/cid';
import store from '../../services/store';
import mapReducers from '../../services/map-reducers';

/*
 Available classes:

 jqconsole: The main console container.
 jqconsole, jqconsole-blurred: The main console container, when not in focus.
 jqconsole-cursor: The cursor.
 jqconsole-header: The welcome message at the top of the console.
 jqconsole-input: The prompt area during input. May have multiple lines.
 jqconsole-old-input: Previously-entered inputs.
 jqconsole-prompt: The prompt area during prompting. May have multiple lines.
 jqconsole-old-prompt: Previously-entered prompts.
 jqconsole-composition: The div encapsulating the composition of multi-byte characters.
 jqconsole-prompt-text: the text entered in the current prompt
 */

/**
 * @typedef {object} TerminalState
 * @property {string} label
 * @property {string} id
 * @property {string} tabId
 * @property {boolean} hasFocus
 * @property {string} icon
 * @property {number} fontSize
 * @property {string} status
 * @property {[{id: string, text: string}]} history
 * @property {string} [executable]
 * @property {string} [cwd]
 * @property {Array} [packages]
 * @property {string} [version]
 */

const initialState = [getDefault()];

/**
 * @returns {[TerminalState]}
 */
function getDefault() {
  return {
    label: 'Console',
    id: cid(),
    tabId: cid(),
    hasFocus: true,
    icon: 'terminal',
    fontSize: _.toNumber(store.get('fontSize')) || 12,
    status: 'idle',
    history: []
  };
}

/**
 * Update the terminal with idle/busy
 * @param {[TerminalState]} state
 * @param {object} action
 * @returns {[TerminalState]}
 */
function setTerminalState(state, action) {
  const instance = _.find(state, {id: action.id});

  if (instance.status !== action.status) {
    state = _.clone(state);
    instance.status = action.status;
  }

  return state;
}

/**
 * Update the terminal with executed input.
 *
 * This is code that supposedly ran.
 *
 * @param {[TerminalState]} state
 * @param {object} action
 * @returns {[TerminalState]}
 */
function executedInput(state, action) {
  const historyMaxSetting = store.get('terminalHistory'),
    historyMax = historyMaxSetting === null ? 5 : historyMaxSetting;

  if (historyMax > 0 && _.isString(action.code) && action.code.trim().length > 0) {
    state = _.clone(state);
    const instance = _.find(state, {id: action.id});

    instance.history = _.clone(instance.history);
    instance.history.push({id: cid(), text: action.code});
    if (instance.history.length > historyMax) {
      instance.history.shift();
    }
  }

  return state;
}

// /**
//  * Update the terminal with display data
//  * @param {[TerminalState]} state
//  * @param {object} action
//  * @returns {[TerminalState]}
//  */
// function addTerminalResult(state, action) {
//   const jqconsole = getTerminalConsole(action),
//     data = action.data;
//
//   if (data['text/plain']) {
//     jqconsole.Write(data['text/plain'] + '\n', 'jqconsole-output');
//   } else {
//     console.warn('addTerminalResult', 'unknown data type', data);
//   }
//
//   return state;
// }

/**
 * Update the terminal with the new python options
 * @param {[TerminalState]} state
 * @param {object} action
 * @returns {[TerminalState]}
 */
function updateFirstTerminalWithKernel(state, action) {
  state = _.cloneDeep(state);
  let target = state.length ? state[0] : getDefault();

  _.assign(target, action.pythonOptions);

  return state;
}

/**
 * Update the terminal with the new variable state
 * @param {[TerminalState]} state
 * @param {object} action
 * @returns {[TerminalState]}
 */
function updateFirstTerminalWithVariables(state, action) {
  state = _.cloneDeep(state);
  let target = state.length ? state[0] : getDefault();

  target.variables = action.variables;
  return state;
}

/**
 *
 * @param {object} state
 * @param {string} propertyName
 * @param {*} value
 * @param {function} [transform]
 * @returns {object}
 */
function changeProperty(state, propertyName, value, transform) {
  state = _.cloneDeep(state);

  if (transform) {
    value = transform(value);
  }

  _.each(state, (item) => _.set(item, propertyName, value));

  return state;
}

function changePreference(state, action) {
  switch (action.key) {
    case 'fontSize': return changeProperty(state, 'fontSize', action.value, _.toNumber);
    case 'pythonCmd': return changeProperty(state, 'cmd', action.value);
    case 'pythonShell': return changeProperty(state, 'shell', action.value);
    default: return state;
  }
}

export default mapReducers({
  TERMINAL_STATE: setTerminalState,
  IOPUB_EXECUTED_INPUT: executedInput,
  KERNEL_DETECTED: updateFirstTerminalWithKernel,
  VARIABLES_DETECTED: updateFirstTerminalWithVariables,
  CHANGE_PREFERENCE: changePreference
}, initialState);
