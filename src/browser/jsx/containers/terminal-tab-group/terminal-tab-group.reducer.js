import _ from 'lodash';
import Immutable from 'seamless-immutable';
import mapReducers from '../../services/map-reducers';
import commonTabReducers from '../../services/common-tabs-reducers';

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
  return Immutable.from([]);
}

/**
 * Update the terminal with the new python options
 * @param {immutable.List} state
 * @param {object} action
 * @returns {[TerminalState]}
 */
function updateAllTerminalsWithKernel(state, action) {
  _.each(state, (group, groupIndex) => {
    _.each(group.tabs, (tab, tabIndex) => {
      state = state.updateIn([groupIndex, 'tabs', tabIndex, 'content'], content => {
        return content.merge(action.pythonOptions);
      });
    });
  });

  return state;
}

/**
 *
 * @param {Immutable} state
 * @param {string} propertyName
 * @param {*} value
 * @param {function} [transform]
 * @returns {object}
 */
function changeProperty(state, propertyName, value, transform) {
  if (transform) {
    value = transform(value);
  }

  _.each(state, (group, groupIndex) => {
    _.each(group.tabs, (tab, tabIndex) => {
      state = state.setIn([groupIndex, 'tabs', tabIndex, 'content', propertyName], value);
    });
  });

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
  FOCUS_TAB: commonTabReducers.focus,
  KERNEL_DETECTED: updateAllTerminalsWithKernel,
  CHANGE_PREFERENCE: changePreference
}, initialState);
