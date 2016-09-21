import _ from 'lodash';

function toObject(error) {
  const properties = {};

  _.assign(properties, _.pick(error, ['message', 'stack']));
  _.each(error, (value, key) => properties[key] = value);

  return properties;
}

export default {
  toObject
};
