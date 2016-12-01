import _ from 'lodash';

function toObject(source) {

  if (_.isError(source)) {
    const dest = {},
      keys = _.filter(Object.getOwnPropertyNames(source), key => {
        // is not a function
        // does not start with an underscore
        return !_.isFunction(source[key]) && key[0] !== '_';
      });

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      dest[key] = source[key];
    }

    return dest;
  }

  return _.clone(source);
}

export default {
  toObject
};
