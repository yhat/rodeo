'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
  postgresql = require('./postgresql'),
  log = require('../log').asInternal(__filename),
  types = {
    postgresql
  },
  instances = {};

function connect(name, type, options) {
  return bluebird.try(function () {
    log('info', 'connect', {name, type, options});

    if (types[type]) {
      const adapter = types[type].create(),
        connection = types[type].connect(adapter, options);

      instances[name] = {
        type,
        adapter,
        connection
      };
    }
  });
}

function disconnect(name) {
  return bluebird.try(function () {
    log('info', 'disconnect', {name});

    if (name) {
      if (instances[name]) {
        types[instances[name].type].disconnect(instances[name].adapter, instances[name].connection);
      }
    } else {
      _.each(instances, function (item, name) {
        types[instances[name].type].disconnect(instances[name].adapter, instances[name].connection);
      });
    }
  });
}

function query(name, str) {
  return bluebird.try(function () {
    log('info', 'query', {name, str});

    if (instances[name]) {
      return types[instances[name].type].query(instances[name].connection, str);
    }
  });
}

module.exports.connect = connect;
module.exports.disconnect = disconnect;
module.exports.query = query;
