'use strict';

import _ from 'lodash';
import bluebird from 'bluebird';
import files from '../../../services/files';
import EventEmitter from 'events';
import pg from 'pg';

const log = require('../../log').asInternal(__filename),
  sanitize = require('../option-sanitization').sanitize,
  getSqlFiles = _.memoize(() => files.readAllFilesOfExt(__dirname, '.sql')),
  queries = {
    getSchemas: pool =>
      getSqlFiles().then(sqlFiles => pool.query({
        name: '__rodeoGetSchemasSql',
        text: sqlFiles.getSchemasSql,
        values: []
      })),
    getTablesBySchema: (pool, schemaName) =>
      getSqlFiles().then(sqlFiles => pool.query({
        text: sqlFiles.getTablesBySchemaSql,
        values: [schemaName],
        name: '__rodeoGetTablesBySchemaSql'
      })),
    getColumnsBySchemaAndTable: (pool, schemaName, tableName) =>
      getSqlFiles().then(sqlFiles => pool.query({
        text: sqlFiles.getColumnsBySchemaAndTableSql,
        values: [tableName, schemaName],
        name: '__rodeoGetColumnsBySchemaAndTable'
      }))
  },
  queryOptionDefinitions = [
    {
      name: 'rows',
      normalization: [_.toInteger],
      validation: [_.isInteger, 'must be integer'],
      default: 100
    }
  ],
  poolOptionDefinitions = [
    {
      name: 'database',
      validation: [[_.isString, 'must be string']],
      default: 'postgres'
    },
    {
      name: 'user',
      validation: [[_.isString, 'must be string']],
      default: 'postgres'
    },
    {
      name: 'password',
      required: true,
      validation: [[_.isString, 'must be string']]
    },
    {
      name: 'port',
      normalization: [_.toInteger],
      validation: [[_.isInteger, 'must be integer']],
      default: 5432
    },
    {
      name: 'ssl',
      validation: [[_.isBoolean, 'must be boolean']],
      default: false
    },
    {
      name: 'max',
      normalization: [_.toInteger],
      validation: [[_.isInteger, 'must be integer']],
      default: 20
    },
    {
      name: 'min',
      normalization: [_.toInteger],
      validation: [[_.isInteger, 'must be integer']],
      default: 4
    },
    {
      name: 'idleTimeoutMillis',
      normalization: [_.toInteger],
      validation: [[_.isInteger, 'must be integer']],
      default: 4
    }
  ];

/**
 * Passing in null values into the driver has a really high consequence (node _crashes_) :(
 * @param {*} value
 * @returns {*}
 */
function assertValue(value) {
  if (!value) {
    throw new Error('Must have value');
  }

  return value;
}

function formatResult(result) {
  return {
    rowCount: result.rowCount,
    columns: _.map(result.fields, field => ({name: field.name, type: field.format})),
    rows: result.rows
  };
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

function getColumnItems(pool, schemaName) {
  return function (tableName) {
    return queries.getColumnsBySchemaAndTable(pool, schemaName, tableName).then(columns => {
      const itemName = [schemaName, tableName].join('.');

      columns = _.map(columns.rows, normalizeColumnInfo);

      return {
        schemaName,
        tableName,
        label: itemName,
        items: columns,
        isTable: true
      };
    });
  };
}

function getTableItems(pool) {
  return function (schemaName) {
    return queries.getTablesBySchema(pool, schemaName).then(tables => {
      const tableNames = _.map(tables.rows, 'tablename');

      return bluebird.map(tableNames, getColumnItems(pool, schemaName));
    });
  };
}

function isSystemSchema(schemaName) {
  return _.startsWith(schemaName, 'pg_') || schemaName === 'information_schema';
}

function getItems(pool) {
  return queries.getSchemas(pool).then(schemas => {
    const schemaNames = _.filter(_.map(schemas.rows, 'schema_name'), schemaName => !isSystemSchema(schemaName));

    return bluebird.all(_.map(schemaNames, getTableItems(pool))).then(_.flatten);
  });
}

class PostgresqlAdapter extends EventEmitter {
  constructor(pool, schemas) {
    super();
    this.pool = pool;
    this.schemas = schemas;

    pool.on('connect', () => this.emit('connect'));
    pool.on('error', error => this.emit('error', error));
    pool.on('notification', msg => log('info', 'notification', msg));
    pool.on('notice', msg => log('info', 'notice', msg));
    pool.on('end', () => log('info', 'end'));
  }
  getInfo() {
    return getItems(this.pool).then(items => {
      return {items};
    });
  }
  query(text, options) {
    options = options || {};
    options = sanitize(options, queryOptionDefinitions);

    return new bluebird((resolve, reject) => {
      const onError = error => {
          log('error', 'postgresql error', error);
          reject(error);
        },
        pool = this.pool,
        queryObj = _.assign({text, rowMode: 'array'}, options);

      pool.on('error', onError);

      pool.query(queryObj)
        .then(formatResult)
        .then(result => {
          pool.removeListener('error', onError);
          resolve(result);
        })
        .catch(onError);
    });
  }
  disconnect() {
    return this.pool.release();
  }
}

function create(options) {
  return new bluebird(function (resolve, reject) {
    const onError = error => {
        reject(error);
      },
      pool = new pg.Pool(_.assign({Promise: require('bluebird')}, sanitize(options, poolOptionDefinitions)));

    pool.on('error', onError);

    queries.getSchemas(pool).then(schemas => {
      pool.removeListener('error', onError);
      resolve(new PostgresqlAdapter(pool, schemas));
    }).catch(onError);
  });
}

module.exports.create = create;
