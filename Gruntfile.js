'use strict';

const _ = require('lodash'),
  path = require('path'),
  pkg = require('./package.json'),
  ignoredDirectories = [
    'node_modules/.bin',
    'node_modules/electron-compile/node_modules/electron-compilers',
    'public',
    'marketing',
    'scripts',
    'bin'
  ],
  lintedJS = [
    'Gruntfile.js',
    'build/**/*.js'
    // 'src/**/*.js'
  ];

/**
 * @param {object} pkg
 * @returns {object}
 */
function getDefaultOptions(pkg) {
  return _.pickBy({
    name: pkg.productName,
    'app-version': pkg.version,
    'app-bundle-id': pkg.appBundleId,
    'helper-bundle-id': pkg.helperBundleId,
    dir: '.',
    out: null,
    version: pkg.devDependencies['electron-prebuilt'],
    platform: null,
    arch: null,
    asar: true,
    prune: true,
    icon: path.join('resources', 'app.icns'),
    ignore: ignoredDirectories
  }, _.identity);
}

/**
 * @param {object} pkg
 * @returns {object}
 */
function getElectronConfig(pkg) {
  return {
    osxBuild: {
      options: _.assign(getDefaultOptions(pkg), {
        out: path.join('dist', 'darwin', 'x64'),
        platform: 'darwin',
        arch: 'x64'
      })
    },
    windows32Build: {
      options: _.assign(getDefaultOptions(pkg), {
        out: path.join('dist', 'win32', 'ia32'),
        platform: 'win32',
        arch: 'ia32'
      })
    },
    windows64Build: {
      options: _.assign(getDefaultOptions(pkg), {
        out: path.join('dist', 'win32', 'x64'),
        platform: 'win32',
        arch: 'x64'
      })
    }
  };
}

/**
 * @param {object} pkg
 * @returns {object}
 */
function getElectronDebianInstallerConfig(pkg) {
  return {
    options: {
      name: pkg.productName,
      version: pkg.version,
      productName: pkg.productName,
      productDescription: pkg.productDescription,
      section: 'devel',
      priority: 'optional',
      categories: ['Utility'],
      rename: function (dest) {
        return dest + '<%= name %>_<%= version %>_<%= arch %>.deb';
      }
    },
    linux32: {
      options: {
        arch: 'i386',
        depends: [] // i think python, ipython, etc. would go here (?)
      },
      src: 'build/linux/all/Rodeo-linux-ia32/',
      dest: 'build/linux/all/Rodeo-linux-ia32/'
    },
    linux64: {
      options: {
        arch: 'amd64',
        depends: [] // i think python, ipython, etc. would go here (?)
      },
      src: 'build/linux/all/Rodeo-linux-x64/',
      dest: 'build/linux/all/Rodeo-linux-x64/'
    }
  };
}

/**
 * @param {object} grunt
 */
module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    electron: getElectronConfig(pkg),
    'electron-debian-installer': getElectronDebianInstallerConfig(pkg),
    eslint: { files: lintedJS }
  });

  grunt.loadNpmTasks('grunt-electron-installer');
  grunt.loadNpmTasks('grunt-electron-debian-installer');
  grunt.registerTask('default', ['eslint', 'electron-debian-installer']);
};
