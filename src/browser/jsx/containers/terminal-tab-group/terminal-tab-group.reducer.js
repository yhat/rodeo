import _ from 'lodash';
import Immutable from 'seamless-immutable';
import mapReducers from '../../services/map-reducers';
import commonTabsReducers from '../../services/common-tabs-reducers';

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
 * @typedef {object} TerminalTabGroup
 * @property {string} groupId
 * @property {string} active
 * @property {[TerminalTab]} tabs
 */

/**
 * @typedef {object} TerminalTab
 * @property {string} label
 * @property {string} id
 * @property {string} icon
 * @property {TerminalState} content
 */

/**
 * @typedef {object} TerminalState
 * @property {number} fontSize
 * @property {string} [executable]
 * @property {string} [cwd]
 * @property {string} [version]
 */

const initialState = getDefault();

function getDefault() {
  return Immutable.from([{}]);
}

/**
 * Update the terminal with the new python options
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function updateAllTerminalsWithKernel(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'terminal', (tab, cursor) => {
    state = state.updateIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content'], content => {
      return content.merge(action.pythonOptions);
    });
  });

  return state;
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function changePreference(state, action) {
  switch (action.key) {
    case 'fontSize': return commonTabsReducers.changeProperty(state, 'fontSize', action.value, _.toNumber);
    case 'pythonCmd': return commonTabsReducers.changeProperty(state, 'cmd', action.value);
    case 'pythonShell': return commonTabsReducers.changeProperty(state, 'shell', action.value);
    default: return state;
  }
}

/**
 * @param {Array} state
 * @param {object} action
 * @returns {Array}
 */
function workingDirectoryChanged(state, action) {
  commonTabsReducers.eachTabByActionAndContentType(state, action, 'terminal', (tab, cursor) => {
    if (action.cwd) {
      state = state.setIn([cursor.groupIndex, 'tabs', cursor.tabIndex, 'content', 'cwd'], action.cwd);
    }
  });

  return state;
}

export default mapReducers({
  FOCUS_TAB: commonTabsReducers.focus,
  KERNEL_DETECTED: updateAllTerminalsWithKernel,
  CHANGE_PREFERENCE: changePreference,
  WORKING_DIRECTORY_CHANGED: workingDirectoryChanged
}, initialState);
