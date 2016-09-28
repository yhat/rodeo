/**
 * @module
 * @see https://github.com/vitaly-t/pg-promise/issues/206
 */
'use strict';

const _ = require('lodash'),
  log = require('../log').asInternal(__filename),
  pgp = require('pg-promise'),
  events = {
    connect: function (client, dc, isFresh) {
      log('info', 'Connected to database:', client.connectionParameters.database, {isFresh});
    },
    disconnect: function (client) {
      log('info', 'Disconnecting from database:', client.connectionParameters.database);
    },
    error: function (err, e) {
      log('error', 'Error with database', err, e);
    },
    query: function (e) {
      log('info', 'query', e);
    },
    receive: function (data, result, e) {
      log('info', 'receive', {data, result, e});
    },
    task: function (e) {
      log('info', 'task', e);
    },
    transact: function (e) {
      log('info', 'transact', e);
    }
  };

function create(options) {
  options = _.assign(options || {}, events);

  return pgp(options);
}

function connect(adapter, options) {
  return adapter(options);
}

function disconnect(adapter) {
  adapter.end();
}

function query(instance, str) {
  return instance.result(str);
}

module.exports.create = create;
module.exports.connect = connect;
module.exports.disconnect = disconnect;
module.exports.query = query;
