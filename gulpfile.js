'use strict';

const _ = require('lodash'),
  eslint = require('eslint/lib/cli'),
  globby = require('globby'),
  gulp = require('gulp'),
  babel = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps'),
  concat = require('gulp-concat'),
  gulpUtil = require('gulp-util'),
  karma = require('karma'),
  less = require('gulp-less'),
  uglify = require('gulp-uglify'),
  KarmaServer = karma.Server,
  path = require('path'),
  rename = require('gulp-rename'),
  merge2 = require('merge2'),
  imagemin = require('gulp-imagemin'),
  rework = require('gulp-rework'),
  reworkUrl = require('rework-plugin-url'),
  jsPatterns = [
    'karma.conf.js',
    'gulpfile.js',
    'Gruntfile.js',
    'scripts/**/*.js',
    'src/**/*.js'
  ];

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
    }, function () {
      reject();
    });

    server.start();
  });
}

function getComponentName(filePath) {
  const match = /\/components\/([a-z0-9\-]*)\//.exec(filePath);

  if (match && match[1]) {
    return match[1];
  }
}

/**
 * @param {string} url
 * @returns {string}
 */
function restructureCSSUrls(url) {
  const componentName = getComponentName(this.position.source);

  return componentName ? path.join('..', 'images', componentName, url) : url;
}

/**
 * @param {object} imagePath
 * @param {string} imagePath.dirname
 */
function restructureImagesDirectory(imagePath) {
  const componentName = getComponentName(imagePath.dirname);

  imagePath.dirname = componentName ? path.join('images', componentName) : imagePath.dirname;
}

gulp.task('eslint', function () {
  return globby(jsPatterns).then(function (paths) {
    // additional CLI options can be added here
    let code = eslint.execute(paths.join(' '));

    if (code) {
      // eslint output already written, wrap up with a short message
      throw new gulpUtil.PluginError('lint', new Error('ESLint error'));
    }
  });
});

gulp.task('karma-main', function () {
  return runKarma('karma.main.conf.js');
});

gulp.task('karma-renderer', function () {
  return runKarma('karma.renderer.conf.js');
});

gulp.task('external-scripts', function () {
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/react/dist/react-with-addons.js',
    'node_modules/react-dom/dist/react-dom.js',
    'public/js/lib/owl.carousel.js'
  ]).pipe(concat('external.min.js'))
    .pipe(gulp.dest('static/js'));
});

gulp.task('jsx', function () {
  return gulp.src([
    'public/js/window.ipc.js',
    'public/js/window.store.js',
    'public/jsx/**/*.jsx'
  ]).pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('jsx.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('static/js'));
});

gulp.task('less-external', function () {
  return gulp.src([
    'public/themes/*.less'
  ]).pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('static/css/'));
});

gulp.task('styles', function () {
  return gulp.src([
    'public/jsx/**/*.less'
  ]).pipe(sourcemaps.init())
    .pipe(less())
    .pipe(rework(reworkUrl(restructureCSSUrls), {sourcemap: true}))
    .pipe(concat('jsx.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('static/css/'));
});

gulp.task('images', function () {
  return gulp.src([
    'public/jsx/components/**/*.svg' // no images allowed in other React types, kay?
  ]).pipe(rename(restructureImagesDirectory))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest('static/images'));
});

gulp.task('lint', ['eslint']);
gulp.task('test', ['lint', 'karma-renderer', 'karma-main']);
gulp.task('build', ['less', 'external-scripts', 'jsx']);
gulp.task('run', []);
gulp.task('watch', function () {
  gulp.watch(['public/jsx/**/*.svg'], ['images']);
  gulp.watch(['public/jsx/**/*.less'], ['styles']);
  gulp.watch(['public/jsx/**/*.js', 'public/jsx/**/*.jsx'], ['jsx', 'karma-renderer']);
  gulp.watch(['src/**/*.js'], ['karma-main']);
});
gulp.task('default', ['test', 'build', 'run']);
