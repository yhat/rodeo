/**
 * @module
 * @see https://github.com/vitaly-t/pg-promise/issues/206
 */
'use strict';

const _ = require('lodash'),
  bluebird = require('bluebird'),
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
  },
  queries = {
    getSchemas: () => 'select schema_name from information_schema.schemata',
    getTablesBySchema: schemaName => `SELECT tablename FROM pg_tables WHERE schemaname = '${schemaName}'`,
    getColumnsBySchemaAndTable: (schemaName, tableName) =>
    'SELECT x.nspname || \'.\' || x.relname as \"Table\", x.attnum as \"#\", x.attname as \"Column\", x.\"Type\", ' +
    'case x.attnotnull when true then \'NOT NULL\' else \'\' end as \"NULL\", r.conname as \"Constraint\", r.contype as \"C\", ' +
    'r.consrc, fn.nspname || \'.\' || f.relname as \"F Key\", d.adsrc as \"Default\" FROM (' +
    'SELECT c.oid, a.attrelid, a.attnum, n.nspname, c.relname, a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) as \"Type\", ' +
    'a.attnotnull FROM pg_catalog.pg_attribute a, pg_namespace n, pg_class c WHERE a.attnum > 0 AND NOT a.attisdropped AND a.attrelid = c.oid ' +
    'and c.relkind not in (\'S\',\'v\') and c.relnamespace = n.oid and n.nspname not in (\'pg_catalog\',\'pg_toast\',\'information_schema\')) x ' +
    'left join pg_attrdef d on d.adrelid = x.attrelid and d.adnum = x.attnum ' +
    'left join pg_constraint r on r.conrelid = x.oid and r.conkey[1] = x.attnum ' +
    'left join pg_class f on r.confrelid = f.oid ' +
    'left join pg_namespace fn on f.relnamespace = fn.oid ' +
    'where x.relname = \'' + tableName + '\' and x.nspname = \'' + schemaName + '\' order by 1,2;'
  };

/**
 * @see https://github.com/balderdashy/sails-postgresql/blob/master/lib/adapter.js
 */
function getInfosss(tableName, schemaName) {
  const autoIncrementQuery = 'SELECT t.relname as related_table, a.attname as related_column, s.relname as sequence_name ' +
      'FROM pg_class s JOIN pg_depend d ON d.objid = s.oid JOIN pg_class t ON d.objid = s.oid AND d.refobjid = t.oid ' +
      'JOIN pg_attribute a ON (d.refobjid, d.refobjsubid) = (a.attrelid, a.attnum) JOIN pg_namespace n ON n.oid = s.relnamespace ' +
      'WHERE s.relkind = \'S\' AND n.nspname = \'' + schemaName + '\';',

    indiciesQuery = 'SELECT n.nspname as \"Schema\", c.relname as \"Name\", CASE c.relkind WHEN \'r\' THEN \'table\' ' +
      'WHEN \'v\' THEN \'view\' WHEN \'i\' THEN \'index\' WHEN \'S\' THEN \'sequence\' WHEN \'s\' THEN \'special\' WHEN \'f\' THEN ' +
      '\'foreign table\' END as \"Type\", pg_catalog.pg_get_userbyid(c.relowner) as \"Owner\", c2.relname as \"Table\" ' +
      'FROM pg_catalog.pg_class c LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace ' +
      'LEFT JOIN pg_catalog.pg_index i ON i.indexrelid = c.oid ' +
      'LEFT JOIN pg_catalog.pg_class c2 ON i.indrelid = c2.oid ' +
      'WHERE c.relkind IN (\'i\',\'\') AND n.nspname <> \'pg_catalog\' AND n.nspname <> \'information_schema\' ' +
      'AND n.nspname !~ \'^pg_toast\' AND pg_catalog.pg_table_is_visible(c.oid) ORDER BY 1,2;';
}

function create(options) {
  options = _.assign(options || {}, events);

  return pgp(options);
}

/**
 * @param {object} options
 */
function validateConnectionOptions(options) {
  if (!options.user) {
    throw new Error('Missing username');
  }

  if (!options.password) {
    throw new Error('Missing username');
  }

  if (!options.database) {
    throw new Error('Missing database');
  }
}

function normalizeConnectionOptions(options) {
  return _.reduce(options, function (obj, value, key) {
    if (key === 'username') {
      obj['user'] = value;
    } else {
      obj[key] = value;
    }

    return obj;
  }, {});
}

function connect(adapter, options) {
  options = normalizeConnectionOptions(options);
  validateConnectionOptions(options);

  // the driver lies, it doesn't connect until you query something, so query anything
  const connection = adapter(options);

  return connection.query(queries.getSchemas()).then(function (result) {
    log('info', 'what is happening?2', result, options);
    return connection;
  });
}

function disconnect(adapter) {
  adapter.end();
}

function query(instance, str) {
  return instance.result(str);
}

function normalizeColumnInfo(columnInfo) {
  columnInfo = _.reduce(columnInfo, (acc, value, key) => {
    if (value !== null && value !== undefined) {
      let keyName = _.camelCase(key);

      if (!keyName) {
        keyName = key;
      }

      acc[keyName] = value;
    }

    return acc;
  }, {});

  columnInfo.label = columnInfo.column;
  columnInfo.isColumn = true;

  return columnInfo;
}

function getItems(instance) {
  return instance.result(queries.getSchemas()).then(function (result) {
    let schemaNames = _.map(result.rows, 'schema_name');

    schemaNames = _.filter(schemaNames, schemaName => !_.startsWith(schemaName, 'pg_') && schemaName !== 'information_schema');

    return bluebird.all(_.map(schemaNames, schemaName => {
      return instance.result(queries.getTablesBySchema(schemaName)).then(function (result) {
        const tableNames = _.map(result.rows, 'tablename');

        return bluebird.map(tableNames, tableName => {
          return instance.result(queries.getColumnsBySchemaAndTable(schemaName, tableName)).then(function (result) {
            const columns = _.map(result.rows, normalizeColumnInfo),
              itemName = [schemaName, tableName].join('.');

            log('info', {result, itemName, columns});

            return {
              schemaName,
              tableName,
              label: itemName,
              items: columns,
              isTable: true
            };
          });
        });
      });
    })).then(_.flatten);
  });
}

function getInfo(instance) {
  return bluebird.props({
    items: getItems(instance)
  });
}

module.exports.create = create;
module.exports.connect = connect;
module.exports.disconnect = disconnect;
module.exports.query = query;
module.exports.getInfo = getInfo;
