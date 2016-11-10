import Immutable from 'seamless-immutable';

function pushAtPath(state, path, item) {
  return state.updateIn(path, array => {
    return array.concat([item]);
  });
}

function removeAtPath(state, path, index) {
  return state.updateIn(path, array => {
    array = array.asMutable();

    array.splice(index, 1);

    return Immutable(array);
  });
}

export default {
  removeAtPath,
  pushAtPath
};
