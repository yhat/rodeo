#!/usr/bin/env node

'use strict';

const  _ = require('lodash'),
  os = require('os'),
  path = require('path'),
  rimraf = require('rimraf'),
  mkdirp = require('mkdirp'),
  async = require('async'),
  packager = require('electron-packager'),
  pkg = require('../package.json'),
  args = require('minimist')(process.argv.slice(2), {boolean: ['all']}),
  buildPath = path.join(__dirname, '..', 'build'),
  resPath = path.join(__dirname, '..', 'resources');

/**
 * Cross platform options for electron-packager
 * @param {object} pkg
 * @returns {object}
 */
function getPackagerOptions(pkg) {
  return {
    name: pkg.productName,
    'app-version': pkg.version,
    'app-bundle-id': pkg.appBundleId,
    'helper-bundle-id': pkg.helperBundleId,
    version: pkg.devDependencies['electron-prebuilt'],
    asar: true,
    prune: true,
    dir: '.',
    ignore: [
      'node_modules/.bin',
      'node_modules/electron-compile/node_modules/electron-compilers',
      'public',
      'marketing',
      'scripts',
      'bin'
    ]
  };
}

/**
 * Supported platforms and platfrom specific options
 * @param {object} pkg
 * @returns {object}
 */
function getTasks(pkg) {
  return [
    {platform: 'darwin', arch: 'x64', icon: 'app.icns'},
    {platform: 'win32', arch: 'all', icon: 'app.icns'},
    // { platform: 'win32', arch: 'x64', icon: 'app.icns' },
    {platform: 'linux', arch: 'all', icon: 'app.icns'}
  ].map(function (item) {
    return _.assign({}, item, getPackagerOptions(pkg), {
      icon: path.join(resPath, item.icon),
      out: path.join(buildPath, item.platform, item.arch)
    });
  });
}

/**
 * @param {object} options
 * @param {function} cb
 */
function clean(options, cb) {
  async.applyEachSeries([rimraf, mkdirp], options.out, cb);
}

/**
 * @param {object} options
 * @param {function} cb
 */
function build(options, cb) {
  async.applyEachSeries([clean, packager], options, cb);
}

/**
 * @param {[object]} tasks
 * @returns {boolean}
 */
function isSupported(tasks) {
  return _.every(tasks, {
    platform: args.platform || os.platform(),
    arch: args.arch || os.arch()
  });
}

/**
 * @param {function} cb
 */
function start(cb) {
  let tasks = [];

  if (!args.all) {
    tasks = getTasks(pkg);

    if (!isSupported(tasks)) {
      cb(new Error('Platform not supported yet!'));
      return;
    }
  }

  async.mapSeries(tasks, build, cb);
}

start(function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.error('Build task completed.');
});
