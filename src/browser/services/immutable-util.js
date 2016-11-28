import _ from 'lodash';
import Immutable from 'seamless-immutable';

function pushAtPath(state, path, item) {
  return state.updateIn(path, array => {
    return array.concat([item]);
  });
}

function removeAtPath(state, path, index) {
  return state.updateIn(path, obj => {
    if (_.isArray(obj)) {
      obj = obj.asMutable();

      obj.splice(index, 1);

      return Immutable(obj);
    }

    return obj.without(index);
  });
}

export default {
  removeAtPath,
  pushAtPath
};
