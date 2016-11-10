'use strict';

const bluebird = require('bluebird'),
  expect = require('chai').expect,
  log = require('../log').asInternal(__filename),
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(dirname + '/' + filename, function () {
  this.timeout(10000);
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('connect', function () {
    const fn = lib[this.title];

    it('postgresql', function () {
      return fn('test', 'postgresql', {
        id: 'test',
        type: 'postgresql',
        database: 'postgres',
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'mysecretpassword'
      });
    });
  });

  describe('query', function () {
    const fn = lib[this.title];

    it('postgresql', function () {
      return fn('test', "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")
        .then(result => log('info', result));
    });

    it('postgresql', function () {
      return fn('test', "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")
        .then(result => log('info', result));
    });
  });

  describe('disconnect', function () {
    const fn = lib[this.title];

    it('postgresql', function () {
      return fn('test');
    });
  });

  xdescribe('getOntology', function () {
    const fn = lib[this.title];

    it('metrics', function () {
      return fn({
        postgresql: {
          adapter: 'postgresql',
          database: 'postgres',
          host: 'localhost',
          port: 5432,
          user: 'postgres',
          password: 'mysecretpassword'
        }
      }).then(function (ontology) {
        log('info', require('util').inspect(ontology, {colors: true, depth: 10, showHidden: true}));

        return new bluebird(function (resolve) {
          ontology.connections.postgresql._adapter.query('postgresql', '', 'SELECT * FROM postgres', function () {
            log('info', 'WHATTT', arguments);
            resolve(arguments);
          });
        });
      });
    });

    it('metrics', function () {
      return fn({
        postgresql: {
          adapter: 'postgresql',

          database: 'postgres',
          host: 'localhost',
          port: 5432,
          user: 'postgres',
          password: 'mysecretpassword'
        }
      }).then(function (ontology) {
        log('info', require('util').inspect(ontology, {colors: true, depth: 10, showHidden: true}));

        return new bluebird(function (resolve) {
          ontology.connections.postgresql._adapter.describe('postgresql', '', 'SELECT * FROM postgres', function () {
            log('info', 'WHATTT', arguments);
            resolve(arguments);
          });
        });
      });
    });

    // it('mySql', function () {
    //   return fn({
    //     colinLassoMySql: {
    //       adapter: 'mysql',
    //
    //       host: 'lasso-db.s.yhat.com',
    //       port: 3306,
    //       user: 'piwik',
    //       password: 'dM!WRrd&pnO9'
    //     }
    //   }).then(function (ontology) {
    //     log('info', require('util').inspect(ontology, {colors: true, depth: 10, showHidden: true}));
    //
    //     return new bluebird(function (resolve) {
    //       ontology.connections.colinLassoMySql._adapter.query('colinLassoMySql', '', 'SELECT * FROM table', function () {
    //         log('info', 'WHATTT', arguments);
    //         resolve(arguments);
    //       });
    //     });
    //   });
    // });

    // it('redshift', function () {
    //   return fn({
    //     colinRedshift: {
    //       adapter: 'postgresql',
    //       // database: 'databaseName',
    //       host: 'yhat-dw.cfaqqhomqoaf.us-east-1.redshift.amazonaws.com',
    //       user: 'yhat',
    //       password: '382Court',
    //       port: 5439,
    //       poolSize: 10,
    //       ssl: false
    //     }
    //   }).then(function (ontology) {
    //     log('info', require('util').inspect(ontology, {colors: true, depth: 10, showHidden: true}));
    //
    //     return new bluebird(function (resolve) {
    //       ontology.connections.colinRedshift._adapter.query('colinRedshift', '', 'SELECT * FROM table', function () {
    //         log('info', 'WHATTT', arguments);
    //         resolve(arguments);
    //       });
    //     });
    //   });
    // });
  });
});
