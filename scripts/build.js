#!/usr/bin/env node

'use strict';

var os = require('os');
var path = require('path');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var async = require('async');
var packager = require('electron-packager');
var pkg = require('../package.json');
var args = require('minimist')(process.argv.slice(2), { boolean: ['all'] });

var buildPath = path.join(__dirname, '..', 'build');
var resPath = path.join(__dirname, '..', 'resources');

// Cross platform options for electron-packager
var packagerOptions = {
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
    'node_modules_linux',
    'node_modules_osx',
    'public',
    'marketing',
    'scripts',
    'bin'
  ]
};

// Supported platforms and platfrom specific options
var tasks = [
  { platform: 'darwin', arch: 'x64', icon: 'app.icns' },
  { platform: 'win32', arch: 'all', icon: 'app.icns' },
  { platform: 'linux', arch: 'x64', icon: 'app.icns' }
].map(function (item) {
  return _.assign({}, item, packagerOptions, {
    icon: path.join(resPath, item.icon),
    out: path.join(buildPath, item.platform, item.arch)
  });
});

function clean (options, cb) {
  async.applyEachSeries([rimraf, mkdirp], options.out, cb);
}

function build (options, cb) {
  async.applyEachSeries([clean, packager], options, cb);
}

function start (cb) {
  if (!args.all) {
    tasks = _.where(tasks, {
      platform: args.platform || os.platform(),
      arch: args.arch || os.arch()
    });

    if (!tasks.length) {
      return cb(new Error('Platform not supported yet!'));
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
