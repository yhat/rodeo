/**
 *
 * Modals work on a stack.  A modal that triggers another modal is stacking on top, such that cancelling the top modal
 * returns to the first.
 * @module
 */

import _ from 'lodash';
import cid from '../../services/cid';
import Immutable from 'seamless-immutable';
import mapReducers from '../../services/map-reducers';
import definitions from './definitions.yml';

const initialState = Immutable({
  list: []
});

function selectConnection(state, action) {
  return state.set('active', action.active);
}

function addChange(state, action) {
  const change = action.change,
    itemIndex = _.findIndex(state.list, {id: change.id});

  if (itemIndex > -1) {
    state = state.updateIn(['list', itemIndex], item =>  item.set(change.key, change.value));
  }

  return state;
}

function removeConnection(state, action) {
  const itemIndex = _.findIndex(state.list, {id: action.id});

  if (itemIndex > -1) {
    state = state.updateIn(['list'], list => {
      list = list.asMutable();

      list.splice(itemIndex, 1);

      return list;
    });

    if (state.list[itemIndex]) {
      state = state.set('active', state.list[itemIndex].id);
    } else if (state.list[itemIndex - 1]) {
      state = state.set('active', state.list[itemIndex - 1].id);
    } else {
      state = state.without('active');
    }
  }

  return state;
}

function addConnection(state) {
  const id = cid(),
    type = definitions.defaultType,
    closeable = true;

  state = state.updateIn(['list'], list => {
    list = list.asMutable();

    list.push({id, type, closeable});

    return list;
  });

  state = state.set('active', id);

  return state;
}

export default mapReducers({
  MANAGE_CONNECTIONS_ADD_CHANGE: addChange,
  MANAGE_CONNECTIONS_ADD_CONNECTION: addConnection,
  MANAGE_CONNECTIONS_REMOVE_CONNECTION: removeConnection,
  MANAGE_CONNECTIONS_SELECT_CONNECTION: selectConnection
}, initialState);
