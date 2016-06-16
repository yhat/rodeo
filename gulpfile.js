'use strict';

const _ = require('lodash'),
  builder = require('electron-builder'),
  eslint = require('eslint/lib/cli'),
  globby = require('globby'),
  gulp = require('gulp'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  gulpUtil = require('gulp-util'),
  karma = require('karma'),
  less = require('gulp-less'),
  KarmaServer = karma.Server,
  path = require('path'),
  sourcemaps = require('gulp-sourcemaps'),
  webpackStream = require('webpack-stream'),
  map = require('vinyl-map'),
  tmpBuildDirectory = 'build',
  tmpAppDirectory = 'app',
  tmpBrowserDirectory = path.join(tmpAppDirectory, 'browser'),
  pkg = require('./package.json');

gulp.task('eslint-browser', function () {
  return globby([
    'src/browser/**/*.jsx',
    'src/browser/**/*.js',
    '!**/lib/*',
    '!src/browser/js/**/*',
    '!src/browser/hbs/**/*',
    '!src/browser/ace/**/*'
  ]).then(function (paths) {
    let code = eslint.execute(['--config .eslintrc'].concat(paths).join(' '));

    if (code) {
      // eslint output already written, wrap up with a short message
      throw new gulpUtil.PluginError('lint', new Error('ESLint error'));
    }
  });
});

gulp.task('eslint-node', function () {
  return globby([
    'src/node/**/*.js',
    'karma*.conf.js',
    'gulpfile.js',
    'Gruntfile.js',
    'scripts/**/*.js'
  ]).then(function (paths) {
    // additional CLI options can be added here
    let code = eslint.execute(['--config=".eslintrc-node"', '--no-eslintrc'].concat(paths).join(' '));

    if (code) {
      // eslint output already written, wrap up with a short message
      throw new gulpUtil.PluginError('lint', new Error('ESLint error'));
    }
  });
});

/**
 *
 * @param {string} configFile
 * @returns {Promise}
 */
function runKarma(configFile) {
  return new Promise(function (resolve, reject) {
    const server = new KarmaServer({
      configFile: path.join(__dirname, configFile),
      singleRun: true
    }, function (result) {
      if (result > 0) {
        return reject(new Error(`Karma exited with status code ${result}`));
      }

      resolve();
    });

    server.start();
  });
}

gulp.task('karma-node', function () {
  return runKarma('karma.node.conf.js');
});

gulp.task('karma-browser', function () {
  return runKarma('karma.browser.conf.js');
});

/**
 * Ace is so large that its easier to keep it separate.
 */
gulp.task('ace', function () {
  return gulp.src([
    'src/browser/ace/ace.js',
    'src/browser/ace/**/*.js'
  ]).pipe(concat('ace.min.js'))
    .pipe(gulp.dest(tmpBrowserDirectory));
});

/**
 * This files should be included in every screen, and have already been processed, so keep it separate.
 */
gulp.task('external', function () {
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/react/dist/react-with-addons.js',
    'node_modules/react-dom/dist/react-dom.js',
    'src/browser/jsx/lib/*.js'
  ]).pipe(concat('external.min.js'))
    .pipe(gulp.dest(tmpBrowserDirectory));
});

gulp.task('html', function () {
  return gulp.src([
    'src/browser/jsx/entry/*.html'
  ]).pipe(gulp.dest(tmpBrowserDirectory));
});

/**
 * I don't know why less doesn't do this automatically.
 */
gulp.task('fonts', function () {
  return gulp.src([
    'node_modules/font-awesome/fonts/**/*'
  ]).pipe(gulp.dest(path.join(tmpBrowserDirectory, 'fonts')));
});

gulp.task('themes', ['fonts'], function () {
  return gulp.src([
    'src/browser/themes/*.less'
  ]).pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.join(tmpBrowserDirectory, 'themes')));
});

gulp.task('jsx', function () {
  return gulp.src([
    'src/browser/jsx/entry/*.js'
  ]).pipe(webpackStream(require('./webpack.config.js')))
    .pipe(gulp.dest(tmpBrowserDirectory));
});

gulp.task('hot', function () {
  return gulp.src([
    'src/browser/jsx/entry/*.js'
  ]).pipe(webpackStream(require('./webpack.dev.config.js')))
    .pipe(gulp.dest(tmpBrowserDirectory));
});

gulp.task('images', function () {
  return gulp.src([
    'src/browser/images/**/*.{svg,gif,png}'
  ]).pipe(gulp.dest(path.join(tmpBrowserDirectory, 'images')));
});

/**
 * Copy the node-specific code over to the temp directory that will be distributed with a deployed app
 */
gulp.task('node', function () {
  // copy node program
  return gulp.src([
    'src/node/**/*',
    '!**/*.test*', // leave the tests behind
    '!**/*.md' // leave the documentation behind
  ]).pipe(gulp.dest(path.join(tmpAppDirectory, 'node')));
});

/**
 * Resources specific to the building of the app need to be in this arbitrary but partially hard-coded directory
 * for electron-builder
 */
gulp.task('dist:build-resources', function () {
  return gulp.src(['src/build/**/*'])
    .pipe(gulp.dest(tmpBuildDirectory));
});

/**
 * Make an "app" version of the package.json according to electron-builder's arbitrary rules and put it in the
 * temp directory to be consumed by them.
 */
gulp.task('dist:package.json', function () {
  return gulp.src('package.json')
    .pipe(map(function (chunk) {
      const pkg = JSON.parse(chunk.toString());

      pkg.main = 'node/index.js';

      return JSON.stringify(_.omit(pkg, ['devDependencies', 'build', 'bin']), null, 2);
    }))
    .pipe(gulp.dest(tmpAppDirectory));
});

/**
 * Installs only the dependencies need to the run the app (not build the app) to the tmpAppDirectory
 * @returns {Promise}
 */
gulp.task('dist:npm-install', ['dist:package.json'], function () {
  const path = tmpAppDirectory,
    args = ['--production'];

  return new Promise(function (resolve, reject) {
    require('npm-i')({path, args}, function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
});

/**
 * Regular build, plus extras needed to package and distribute app
 *
 * Remember to set your CSC_NAME or CSC_LINK for code signing!
 * i.e., CSC_NAME="Dane Stuckel" <command>
 *
 * @returns {Promise}
 */
gulp.task('dist:build', ['dist:build-resources', 'dist:npm-install'], function () {
  return builder.build({
    asar: false,
    prune: true,
    platform: ['all'],
    arch: 'all', // for all platforms and architectures
    dist: true, // compile all that we can
    devMetadata: require('./package.json').build
  });
});

/**
 * Regular build, plus extras needed to package and distribute app
 *
 * Remember to set your CSC_NAME or CSC_LINK for code signing!
 * i.e., CSC_NAME="Dane Stuckel" <command>
 *
 * @returns {Promise}
 */
gulp.task('dist:osx', ['dist:build-resources', 'dist:npm-install'], function () {
  return builder.build({
    asar: false,
    prune: true,
    platform: ['darwin'],
    arch: 'all', // for all platforms and architectures
    dist: true, // compile all that we can
    devMetadata: require('./package.json').build
  });
});

gulp.task('upload', function () {
  const s3 = require('gulp-s3'),
    version = pkg.version;

  return gulp.src(['dist/*/*.{dmg,zip,exe}', 'dist/*.deb'])
    .pipe(rename(function (obj) {
      let arch;

      if (/darwin-x64\//.text(obj.dirname)) {
        arch = 'darwin_64';
      } else if (/linux-x64\//.text(obj.dirname)) {
        arch = 'linux_64';
      } else if (/linux-ia32\//.text(obj.dirname)) {
        arch = 'linux_32';
      } else if (/\/win-ia32\//.text(obj.dirname)) {
        arch = 'win_32';
      } else if (/\/win\//.text(obj.dirname)) {
        arch = 'win_64';
      }

      if (arch) {
        obj.basename = `Rodeo-v${version}-${arch}`;
      } else {
        obj.basename = `Rodeo-v${version}`;
      }

      obj.dirname = path.join(version, obj.dirname);
    }))
    .pipe(s3({
      key: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      bucket: 'rodeo-upload-test'
    }));
});

gulp.task('dist', ['dist:build']);
gulp.task('test', ['eslint-node', 'eslint-browser', 'karma-node']);
gulp.task('build', ['themes', 'external', 'images', 'ace', 'jsx', 'html', 'node']);
gulp.task('run', []);
gulp.task('watch', function () {
  gulp.watch(['public/js/**/*.js'], ['js']);
  gulp.watch(['public/jsx/**/*.svg'], ['images']);
  gulp.watch(['public/jsx/**/*.less'], ['styles']);
  gulp.watch(['public/jsx/**/*.js', 'public/jsx/**/*.jsx'], ['jsx', 'karma-renderer']);
  gulp.watch(['src/**/*.js'], ['karma-main']);
});
gulp.task('default', ['test', 'build', 'run']);
