import _ from 'lodash';
import api from './api';

/**
 * Any properties that are strings and empty are removed from shallowly cloned object
 * @param {object} obj
 * @returns {object}
 */
function removeEmptyStrings(obj) {
  return _.reduce(obj, (obj, value, key) => {
    if (typeof value === 'string') {
      if (value) {
        obj[key] = value;
      }
    } else {
      obj[key] = value;
    }

    return obj;
  }, {});
}

function connect(connectionConfig) {
  return api.send('databaseConnect', removeEmptyStrings(connectionConfig));
}

function query(context) {
  return api.send('databaseQuery', context.id, context.text);
}

function getInfo(id) {
  return api.send('databaseInfo', id);
}

function disconnect(id) {
  return api.send('databaseDisconnect', id);
}

export default {
  connect,
  disconnect,
  getInfo,
  query
};
