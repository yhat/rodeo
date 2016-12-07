import _ from 'lodash';
import bluebird from 'bluebird';
import postgresql from './postgresql';

const types = {
    postgresql
  },
  instances = {};

function connect(options) {
  return bluebird.try(function () {
    const id = options.id,
      type = options.type;

    if (!types[type]) {
      throw new Error('DB type does not exist: ' + type);
    }

    return types[type]
      .create(options)
      .then(token => instances[id] = token);
  });
}

function disconnect(id) {
  return bluebird.try(function () {
    if (id) {
      if (instances[id]) {
        instances[id].disconnect.apply(instances[id], arguments);
      }
    } else {
      _.each(instances, function (item, id) {
        instances[id].disconnect.apply(instances[id], arguments);
      });
    }
  });
}

function query(id, str) {
  return bluebird.try(function () {
    if (instances[id]) {
      return instances[id].query(str);
    }
  });
}

function getInfo(id) {
  return bluebird.try(function () {
    if (instances[id]) {
      return instances[id].getInfo();
    }
  });
}

module.exports.connect = connect;
module.exports.disconnect = disconnect;
module.exports.getInfo = getInfo;
module.exports.query = query;
