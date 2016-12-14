import _ from 'lodash';
import Immutable from 'seamless-immutable';
import {local} from '../../services/store';
import mapReducers from '../../services/map-reducers';
import reduxUtil from '../../services/redux-util';
import immutableUtil from '../../services/immutable-util';
import layoutDefinition from './layout.yml';
import envService from '../../services/env';

function extendList(env, localKey, envKey, item) {
  const localValue = local.get(localKey) || [],
    pathList = _.map(localValue, value => {
      return {value, source: 'user'};
    }).concat(_.map(envService.getPath(env, envKey), value => {
      return ({value, source: 'system', editable: false});
    }));

  return _.assign({value: pathList}, item);
}

const prefix = reduxUtil.fromFilenameToPrefix(__filename),
  omitKeys = ['path', 'npm_token', 'node_env', 'google_api_key', 'apple_pubsub_socket_render', 'display'],
  getItemKeys = {
    environmentVariablePath: (env, item) => {
      const envKey = 'path',
        localKey = 'additionalEnvironmentVariablePath';

      return extendList(env, localKey, envKey, item);
    },
    environmentVariablePythonPath: (env, item) => {
      const envKey = 'pythonPath',
        localKey = 'additionalEnvironmentVariablePythonPath';

      return extendList(env, localKey, envKey, item);
    },
    remainingEnvironmentVariables: (env, item) => {
      const cleanedEnv = getCleanedEnvironmentVariables(env),
        localKey = 'overriddenEnvironmentVariables',
        localValue = local.get(localKey) || {},
        envList = _.map(localValue, (value, key) => {
          return {key, value, source: 'user'};
        }).concat(_.map(_.omit(cleanedEnv, Object.keys(localValue)), (value, key) => {
          return {key, value, source: 'system', editable: false};
        }));

      return _.assign({value: envList}, item);
    }
  },
  setItemKeys = {
    environmentVariablePath: (change) => {
      const result = _.map(_.filter(change.value, {source: 'user'}), 'value');

      local.set('additionalEnvironmentVariablePath', result);
    },
    environmentVariablePythonPath: (change) => {
      const result = _.map(_.filter(change.value, {source: 'user'}), 'value');

      local.set('additionalEnvironmentVariablePythonPath', result);
    },
    remainingEnvironmentVariables: (change) => {
      const result = _.reduce(_.filter(change.value, {source: 'user'}), (obj, item) => {
        obj[item.key] = item.value;

        return obj;
      }, {});

      local.set('overriddenEnvironmentVariables', result);
    }
  };

function getStateFromStore() {
  const env = envService.getEnvironmentVariablesRaw() || {},
    items = _.map(layoutDefinition, item => {
      if (getItemKeys[item.key]) {
        return getItemKeys[item.key](env, item);
      }

      return item;
    });

  return Immutable({
    items,
    changes: {},
    canSave: true
  });
}

function setStateToStore(state) {
  _.each(state.changes, function (change, changeName) {
    if (setItemKeys[changeName]) {
      return setItemKeys[changeName](change);
    }
  });
}

function getCleanedEnvironmentVariables(env) {
  const envKeyMap = env && envService.getKeyMap(env);

  return _.pick(env, _.values(_.omit(envKeyMap, omitKeys)));
}

export function getInitialState() {
  return getStateFromStore();
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

  // the container should be the initial state of the "add" box, regardless of changed value
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
      value = immutableUtil.removeAt(value, 0);
      state = state.setIn(['changes', itemKey], {key: item.key, type: item.type, value});
    }
  }

  return state;
}

function saveEdit(state, action) {
  const item = action.payload,
    editContainer = _.get(state, ['changes', item.key, 'editContainer']);

  if (item.type === 'list') {
    // is input-list
    state = immutableUtil.unshiftAtPath(state, ['changes', item.key, 'value'],
      {source: 'user', value: editContainer.value});
    state = immutableUtil.removeAtPath(state, ['changes', item.key], 'editContainer');
  } else if (item.type === 'keyValueList' && editContainer.name) {
    // is input-key-value-list
    const list = _.get(state, ['changes', item.key, 'value']),
      index = _.findIndex(list, {key: editContainer.name});

    // if there is a key with this name already, remove it
    if (index > -1) {
      state = immutableUtil.removeAtPath(state, ['changes', item.key, 'value'], index);
    }

    state = immutableUtil.unshiftAtPath(state, ['changes', item.key, 'value'],
      {source: 'user', key: editContainer.name, value: editContainer.value});
    state = immutableUtil.removeAtPath(state, ['changes', item.key], 'editContainer');
  }

  return state;
}

function saveChanges(state) {
  setStateToStore(state);

  // pretend to be fresh
  return getStateFromStore();
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
}), {});
