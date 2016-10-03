'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  postgresql = require('./postgresql'),
  log = require('../log').asInternal(__filename),
  types = {
    postgresql
  },
  instances = {};

function connect(options) {
  return bluebird.try(function () {
    log('info', 'connect', {options});
    const id = options.id,
      type = options.type,
      config = _.omit(options, ['name', 'type', 'id']);

    if (types[type]) {
      log('info', 'found type', type, types[type]);
      const adapter = types[type].create();

      return types[type].connect(adapter, config).then(function (connection) {
        instances[id] = {
          type,
          adapter,
          connection
        };
      });
    } else {
      throw new Error('DB type does not exist: ' + type);
    }
  });
}

function disconnect(id) {
  return bluebird.try(function () {
    log('info', 'disconnect', {id});

    if (id) {
      if (instances[id]) {
        types[instances[id].type].disconnect(instances[id].adapter, instances[id].connection);
      }
    } else {
      _.each(instances, function (item, id) {
        types[instances[id].type].disconnect(instances[id].adapter, instances[id].connection);
      });
    }
  });
}

function query(id, str) {
  return bluebird.try(function () {
    log('info', 'query', {id, str});

    if (instances[id]) {
      return types[instances[id].type].query(instances[id].connection, str);
    }
  });
}

module.exports.connect = connect;
module.exports.disconnect = disconnect;
module.exports.query = query;
