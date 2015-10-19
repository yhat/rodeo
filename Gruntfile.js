var path = require('path');
var pkg = require('./package.json')

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var ignoredDirectories = [
    'node_modules/.bin',
    'node_modules/electron-compile/node_modules/electron-compilers',
    'public',
    'marketing',
    'scripts',
    'bin'
  ];

  var defaultOptions = {
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
    icon: path.join("resources", "app.icns"),
    ignore: ignoredDirectories
  }

  var osxOptions = JSON.parse(JSON.stringify(defaultOptions));
  osxOptions.out = path.join('dist', 'darwin', 'x64');
  osxOptions.platform = 'darwin';
  osxOptions.arch = 'x64';

  var windows32Options = JSON.parse(JSON.stringify(defaultOptions));;
  windows32Options.out = path.join('dist', 'win32', 'ia32');
  windows32Options.platform = 'win32';
  windows32Options.arch = 'ia32';

  var windows64Options = JSON.parse(JSON.stringify(defaultOptions));;
  windows64Options.out = path.join('dist', 'win32', 'x64');
  windows64Options.platform = 'win32';
  windows64Options.arch = 'x64';

  var linux32Options = JSON.parse(JSON.stringify(defaultOptions));;
  linux32Options.out = path.join('dist', 'linux', 'x64');
  linux32Options.platform = 'win32';
  linux32Options.arch = 'x64';

  grunt.initConfig({
    electron: {
      osxBuild: {
        options: osxOptions
      },
      windows32Build: {
        options: windows32Options
      },
      windows64Build: {
        options: windows64Options
      }
    },
    'electron-debian-installer': {
      options: {
        name: pkg.productName,
        version: pkg.version,
        productName: pkg.productName,
        productDescription: pkg.productDescription,
        section: 'devel',
        priority: 'optional',
        categories: [
          'Utility'
        ],
        rename: function (dest, src) {
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
    }
  });

  grunt.loadNpmTasks('grunt-electron-installer');
  grunt.loadNpmTasks('grunt-electron-debian-installer');
  grunt.registerTask('default', ['electron-debian-installer']);

}
