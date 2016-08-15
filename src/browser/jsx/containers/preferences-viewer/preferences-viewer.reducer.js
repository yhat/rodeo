import _ from 'lodash';
import {local} from '../../services/store';
import mapReducers from '../../services/map-reducers';

import preferencesMapDefinition from './preferences.yml';
import preferencesMapper from '../../services/preferences-mapper';

import globalSettingsText from './global-settings.md';
import pythonSettingsText from './python-settings.md';
import aceEditorText from './ace-editor.md';
import consoleText from './console.md';
import plotSettingsText from './plot-settings.md';
import checkBackLaterGit from './check-back-later-git.md';
import checkBackLaterProjectSettings from './check-back-later-project-level-settings.md';

const initialState = getDefault();

function getDefault() {
  const preferenceMap = preferencesMapper.define(preferencesMapDefinition, {
      globalSettingsText,
      pythonSettingsText,
      aceEditorText,
      consoleText,
      plotSettingsText,
      checkBackLaterGit,
      checkBackLaterProjectSettings
    }),
    active = _.head(preferenceMap).id;

  return {
    active,
    preferenceMap,
    changes: {},
    canSave: true
  };
}

function changeSaved(state, action) {
  state = _.clone(state);
  const changes = _.clone(state.changes),
    change = action.change,
    groupIndex = _.findIndex(state.preferenceMap, {id: state.active}),
    keyIndex = _.findIndex(state.preferenceMap[groupIndex].items, {key: change.key}),
    key = change.key;

  if (keyIndex > -1) {
    state.preferenceMap[groupIndex].items[keyIndex].value = change.value;
  }

  if (changes[key]) {
    delete changes[key];
  }

  state.changes = changes;
  state.canSave = _.every(changes, {state: 'valid'});
  return state;
}

function cancelAllChanges(state) {
  state = _.clone(state);

  state.changes = {};
  state.canSave = true;
  return state;
}

function changeAdded(state, action) {
  state = _.clone(state);
  const changes = _.clone(state.changes),
    change = action.change,
    key = change.key,
    value = change.value,
    savedValue = local.get(change.key);

  if (changes[key]) {
    if (savedValue === value) {
      delete changes[key];
    } else if (changes[key].value !== value) {
      // remove extra details
      changes[key] = _.pick(_.assign({}, changes[key], change), ['key', 'value', 'type', 'state']);
    }
  } else {
    changes[key] = _.defaults(change, {state: 'valid'});
  }

  state.canSave = _.every(changes, {state: 'valid'});
  state.changes = changes;
  return state;
}

function changeDetailAdded(state, action) {
  state = _.clone(state);
  const changes = _.clone(state.changes),
    change = action.change,
    key = change.key,
    value = change.value;

  if (changes[key] && changes[key].value === value) {
    changes[key] = _.assign(changes[key], change);
  }

  state.canSave = _.every(changes, {state: 'valid'});
  state.changes = changes;
  return state;
}

function activeTabChanged(state, action) {
  state = _.clone(state);
  state.active = action.active;

  return state;
}

export default mapReducers({
  PREFERENCE_CHANGE_SAVED: changeSaved,
  PREFERENCE_ACTIVE_TAB_CHANGED: activeTabChanged,
  PREFERENCE_CHANGE_ADDED: changeAdded,
  PREFERENCE_CHANGE_DETAIL_ADDED: changeDetailAdded,
  PREFERENCE_CANCEL_ALL_CHANGES: cancelAllChanges
}, initialState);
