import _ from 'lodash';
import Immutable from 'seamless-immutable';
import {local} from '../../services/store';
import mapReducers from '../../services/map-reducers';
import reduxUtil from '../../services/redux-util';
import immutableUtil from '../../services/immutable-util';
import preferencesMapDefinition from './preferences.yml';
import preferencesMapper from '../../services/preferences-mapper';

const prefix = reduxUtil.fromFilenameToPrefix(__filename);

export function getInitialState() {
  let active;
  const preferenceMap = preferencesMapper.define(preferencesMapDefinition);

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

function getCurrentItemValueByKey(state, key) {
  const groupIndex = _.findIndex(state.preferenceMap, {id: state.active});

  if (groupIndex > -1) {
    const keyIndex = _.findIndex(state.preferenceMap[groupIndex].items, {key});

    if (keyIndex > -1) {
      return _.get(state, ['preferenceMap', groupIndex, 'items', keyIndex, 'value']);
    }
  }
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
  return state.set('active', action.payload.active);
}

function addFromListContainer(state, action) {
  // assume they have a "key" and a "value" in a "container"
  const container = action.payload.container;
  let currentValue = _.get(state, ['changes', container.key, 'value']);

  // set the new entry
  currentValue = currentValue.set(container.name, container.value);

  state = state.setIn(['changes', container.key, 'value'], currentValue);
  state = immutableUtil.removeAtPath(state, ['changes', container.key], 'container');

  return state;
}

function addListContainer(state, action) {
  // Only a single container can exist at a time, and it is associated with an item
  // in preferences

  const item = action.payload.item,
    key = item.key,
    value = getCurrentItemValueByKey(state, key);

  return state.setIn(['changes', key], {key, type: item.key, container: action.payload.container, value});
}

function cancelListContainer(state, action) {
  const key = action.payload.key;

  return immutableUtil.removeAtPath(state, ['changes', key], 'container');

  // todo:  if there were no changes in the item besides this, remove the change completely
}

function changeContainerValue(state, action) {
  const key = action.payload.key,
    propertyName = action.payload.propertyName;

  return state.setIn(['changes', key, 'container', propertyName], action.payload.value);
}

function removeFromList(state, action) {
  const item = action.payload.item,
    itemKey = item.key,
    listRowName = action.payload.key;

  if (_.get(state, ['changes', itemKey])) {
    state = immutableUtil.removeAtPath(state, ['changes', itemKey, 'value'], listRowName);
  } else {
    let value = getCurrentItemValueByKey(state, itemKey);

    if (value) {
      value = value.without(listRowName);
      state = state.setIn(['changes', itemKey], {key: item.key, type: item.type, value});
    }
  }

  return state;
}

export default mapReducers(_.assign(reduxUtil.addPrefixToKeys(prefix, {
  ACTIVE_TAB_CHANGED: activeTabChanged,
  ADD_FROM_LIST_CONTAINER: addFromListContainer,
  ADD_LIST_CONTAINER: addListContainer,
  CANCEL_ALL_CHANGES: cancelAllChanges,
  CANCEL_LIST_CONTAINER: cancelListContainer,
  CHANGE_ADDED: changeAdded,
  CHANGE_CONTAINER_VALUE: changeContainerValue,
  CHANGE_DETAIL_ADDED: changeDetailAdded,
  REMOVE_FROM_LIST: removeFromList
}), {
  PREFERENCE_CHANGE_SAVED: changeSaved
}), getInitialState());
