import _ from 'lodash';
import Immutable from 'seamless-immutable';
import {local} from '../../services/store';
import mapReducers from '../../services/map-reducers';
import reduxUtil from '../../services/redux-util';
import immutableUtil from '../../services/immutable-util';
import layoutDefinition from './layout.yml';
import envService from '../../services/env';

const prefix = reduxUtil.fromFilenameToPrefix(__filename),
  omitKeys = ['path', 'npm_token', 'node_env', 'google_api_key', 'apple_pubsub_socket_render', 'display'];

export function getInitialState() {
  const env = local.get('environmentVariables'),
    envKeyMap = env && envService.getKeyMap(env),
    items = _.map(layoutDefinition, item => {
      if (item.key === 'environmentVariablePath') {
        return _.assign({value: envService.getPath(env)}, item);
      } else if (item.key === 'remainingEnvironmentVariables') {
        const remainingEnvKeys = _.omit(envKeyMap, omitKeys);

        return _.assign({value: _.pick(env, _.values(remainingEnvKeys))}, item);
      }

      return item;
    });

  return Immutable({
    items,
    changes: {},
    canSave: true
  });
}

/**
 * @param {object} state
 * @param {{key: string, value: string}} change
 * @returns {object}
 */
function updateValueWithChange(state, change) {
  const key = change.key,
    keyIndex = _.findIndex(state.items, {key});

  if (keyIndex > -1) {
    state = state.setIn(['items', keyIndex, 'value'], change.value);
  }

  return state;
}

function getCurrentItemByKey(state, key) {
  const keyIndex = _.findIndex(state.items, {key});

  if (keyIndex > -1) {
    return _.get(state, ['items', keyIndex]);
  }
}

function getCurrentItemValueByKey(state, key) {
  const item = getCurrentItemByKey(state, key);

  return item && item.value;
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

  state = updateValueWithChange(state, action.change);

  if (state.changes[key]) {
    state = state.update('changes', changes => changes.without(key));
  }

  return updateCanSave(state);
}

function cancelChanges(state) {
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

function startEdit(state, action) {
  const payload = action.payload,
    item = payload.item,
    change = _.get(state, ['changes', item.key]);

  if (change) {
    state = state.updateIn(['changes', item.key], change => change.set('editContainer', payload.container));
  } else {
    state = state.setIn(['changes', item.key], _.assign({editContainer: payload.container}, item));
  }

  return state;
}

function cancelEdit(state, action) {
  const key = action.payload.key;

  return immutableUtil.removeAtPath(state, ['changes', key], 'editContainer');
}

function changeEditValue(state, action) {
  const key = action.payload.item.key,
    target = action.payload.target;

  return state.setIn(['changes', key, 'editContainer', target], action.payload.value);
}

function removeKey(state, action) {
  const item = action.payload.item,
    itemKey = item.key,
    listRowName = action.payload.key;

  if (_.has(state, ['changes', itemKey])) {
    state = immutableUtil.removeAtPath(state, ['changes', itemKey, 'value'], listRowName);
  } else {
    let value = getCurrentItemValueByKey(state, itemKey);

    if (value) {
      state = state.setIn(['changes', itemKey], {key: item.key, type: item.type, value: _.omit(value, listRowName)});
    }
  }

  return state;
}

function saveEdit(state, action) {
  const item = action.payload,
    editContainer = _.get(state, ['changes', item.key, 'editContainer']),
    originalValue = getCurrentItemByKey(state, item.key).value;

  if (_.isArray(originalValue) && editContainer.name === '') {
    state = immutableUtil.pushAtPath(state, ['changes', item.key, 'value'], editContainer.value);
    return immutableUtil.removeAtPath(state, ['changes', item.key], 'editContainer');
  } else if (!_.isArray(originalValue) && editContainer.name) {
    state = state.setIn(['changes', item.key, 'value', editContainer.name], editContainer.value);
    return immutableUtil.removeAtPath(state, ['changes', item.key], 'editContainer');
  }

  return state;
}

function saveChanges(state, action) {
  // for graphics, these actions are the same for now
  return cancelChanges(state, action);
}

export default mapReducers(_.assign(reduxUtil.addPrefixToKeys(prefix, {
  CANCEL_CHANGES: cancelChanges,
  CHANGE_ADDED: changeAdded,
  CHANGE_DETAIL_ADDED: changeDetailAdded,
  START_EDIT: startEdit,
  CANCEL_EDIT: cancelEdit,
  SAVE_EDIT: saveEdit,
  CHANGE_EDIT_VALUE: changeEditValue,
  REMOVE_KEY: removeKey,
  SAVE_CHANGES: saveChanges
}), {
  PREFERENCE_CHANGE_SAVED: changeSaved
}), getInitialState());
