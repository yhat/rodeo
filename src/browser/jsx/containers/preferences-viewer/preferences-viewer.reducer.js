import _ from 'lodash';
import Immutable from 'seamless-immutable';
import {local} from '../../services/store';
import mapReducers from '../../services/map-reducers';

import preferencesMapDefinition from './preferences.yml';
import preferencesMapper from '../../services/preferences-mapper';

import globalSettingsText from './global-settings.md';
import pythonSettingsText from './python-settings.md';
import sqlSettingsText from './sql-settings.md';
import aceEditorText from './ace-editor.md';
import consoleText from './console.md';
import plotSettingsText from './plot-settings.md';
import checkBackLaterGit from './check-back-later-git.md';
import checkBackLaterProjectSettings from './check-back-later-project-level-settings.md';

export function getInitialState() {
  let active;
  const preferenceMap = preferencesMapper.define(preferencesMapDefinition, {
    globalSettingsText,
    pythonSettingsText,
    sqlSettingsText,
    aceEditorText,
    consoleText,
    plotSettingsText,
    checkBackLaterGit,
    checkBackLaterProjectSettings
  });

  if (preferenceMap && preferenceMap.length > 0) {
    active = _.head(preferenceMap).id;
  }

  return Immutable({
    active,
    preferenceMap,
    changes: {},
    canSave: true
  });
}

/**
 * @param {object} state
 * @param {{key: string, value: string}} change
 * @returns {object}
 */
function updatePreferenceMapValueWithChange(state, change) {
  const key = change.key,
    groupIndex = _.findIndex(state.preferenceMap, {id: state.active});

  if (groupIndex > -1) {
    const keyIndex = _.findIndex(state.preferenceMap[groupIndex].items, {key});

    if (keyIndex > -1) {
      state = state.setIn(['preferenceMap', groupIndex, 'items', keyIndex, 'value'], change.value);
    }
  }

  return state;
}

/**
 * @param {object} state
 * @returns {object}
 */
function updateCanSave(state) {
  const canSave = _.every(state.changes, {state: 'valid'});

  if (state.canSave !== canSave) {
    state = state.set('canSave', canSave);
  }

  return state;
}

/**
 *
 * @param {object} state
 * @param {{change: {key: string, value: string}}} action
 * @returns {object}
 */
function changeSaved(state, action) {
  const key = action.change.key;

  state = updatePreferenceMapValueWithChange(state, action.change);

  if (state.changes[key]) {
    state = state.update('changes', changes => changes.without(key));
  }

  return updateCanSave(state);
}

function cancelAllChanges(state) {
  state = state.set('changes', {});
  state = state.set('canSave', true);
  return state;
}

function changeAdded(state, action) {
  const key = action.change.key;

  if (state.changes[key]) {
    const value = action.change.value,
      savedValue = local.get(action.change.key);

    if (savedValue === value) {
      state = state.update('changes', changes => changes.without(key));
    } else if (state.changes[key].value !== value) {
      state = state.setIn(
        ['changes', key],
        Immutable(_.pick(_.assign({}, state.changes[key], action.change), ['key', 'value', 'type', 'state']))
      );
    } // else we shouldn't change anything
  } else {
    state = state.setIn(['changes', key], _.defaults(action.change, {state: 'valid'}));
  }

  return updateCanSave(state);
}

function changeDetailAdded(state, action) {
  const changes = state.changes,
    change = action.change,
    key = change.key;

  if (changes[key] && changes[key].value === change.value) {
    state = state.setIn(['changes', key], Immutable(_.assign({}, changes[key], change)));
  }

  return updateCanSave(state);
}

function activeTabChanged(state, action) {
  return state.set('active', action.active);
}

export default mapReducers({
  PREFERENCE_CHANGE_SAVED: changeSaved,
  PREFERENCE_ACTIVE_TAB_CHANGED: activeTabChanged,
  PREFERENCE_CHANGE_ADDED: changeAdded,
  PREFERENCE_CHANGE_DETAIL_ADDED: changeDetailAdded,
  PREFERENCE_CANCEL_ALL_CHANGES: cancelAllChanges
}, getInitialState());
