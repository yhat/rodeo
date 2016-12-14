import _ from 'lodash';
import Immutable from 'seamless-immutable';

function unshift(state, item) {
  const mutableArray = state.asMutable();

  mutableArray.unshift(item);

  return Immutable(mutableArray);
}

function unshiftAtPath(state, path, item) {
  return state.updateIn(path, array => {
    return unshift(array, item);
  });
}

function push(state, item) {
  const mutableArray = state.asMutable();

  mutableArray.push(item);

  return Immutable(mutableArray);
}

function pushAtPath(state, path, item) {
  return state.updateIn(path, array => {
    return push(array, item);
  });
}

function removeAt(state, index) {
  if (_.isArray(state)) {
    state = state.asMutable();

    state.splice(index, 1);

    return Immutable(state);
  }

  return state.without(index);
}

function removeAtPath(state, path, index) {
  return state.updateIn(path, obj => {
    return removeAt(obj, index);
  });
}

export default {
  removeAt,
  removeAtPath,
  push,
  pushAtPath,
  unshift,
  unshiftAtPath
};
