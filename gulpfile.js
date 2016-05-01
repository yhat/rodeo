'use strict';

const _ = require('lodash'),
  babel = require('gulp-babel'),
  babelify = require('babelify'),
  browserify = require('browserify'),
  declare = require('gulp-declare'),
  eslint = require('eslint/lib/cli'),
  globby = require('globby'),
  gulp = require('gulp'),
  handlebars = require('gulp-handlebars'),
  concat = require('gulp-concat'),
  gulpUtil = require('gulp-util'),
  karma = require('karma'),
  less = require('gulp-less'),
  uglify = require('gulp-uglify'),
  KarmaServer = karma.Server,
  path = require('path'),
  rename = require('gulp-rename'),
  sourcemaps = require('gulp-sourcemaps'),
  merge2 = require('merge2'),
  imagemin = require('gulp-imagemin'),
  rework = require('gulp-rework'),
  reworkUrl = require('rework-plugin-url'),
  wrap = require('gulp-wrap'),
  webpack = require('webpack-stream'),
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
    'public/js/lib/*.js'
  ]).pipe(concat('external.min.js'))
    .pipe(gulp.dest('static/js'));
});

gulp.task('hbs', function () {
  let helpers, partials, templates;

  helpers = gulp.src('public/hbs/helpers/*.js');

  partials = gulp.src('public/hbs/partials/*.hbs')
    .pipe(handlebars())
    .pipe(wrap('Handlebars.registerPartial(<%= processPartialName(file.relative) %>, Handlebars.template(<%= contents %>));', {}, {
      imports: {
        processPartialName: function (fileName) {
          // Strip the extension and the underscore
          // Escape the output with JSON.stringify
          return JSON.stringify(path.basename(fileName, '.js').substr(1));
        }
      }
    }));

  templates = gulp.src([
    'public/hbs/*.hbs',
    '!public/hbs/_*.hbs'
  ]).pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'templates',
      noRedeclare: true
    }));

  return merge2(helpers, partials, templates)
    .pipe(concat('hbs.js'))
    .pipe(gulp.dest('static/js'));
});

gulp.task('ace', function () {
  return gulp.src([
    'public/ace/ace.js',
    'public/ace/**/*.js'
  ]).pipe(concat('ace.min.js'))
    .pipe(gulp.dest('static/js'));
});

gulp.task('js', function () {
  return gulp.src([
    'public/js/window.*.js', // important global services first
    'public/js/**/*.js', // then everyone else
    '!public/js/lib/**/*.js' // no external libraries
  ]).pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('js.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('static/js'));
});

gulp.task('jsx', function () {
  return gulp.src([
    'public/jsx/*.js'
  ]).pipe(webpack(require('./webpack.config.js')))
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
gulp.task('build', ['less-external', 'styles', 'external-scripts', 'hbs', 'ace', 'js', 'jsx']);
gulp.task('run', []);
gulp.task('watch', function () {
  gulp.watch(['public/js/**/*.js'], ['js']);
  gulp.watch(['public/jsx/**/*.svg'], ['images']);
  gulp.watch(['public/jsx/**/*.less'], ['styles']);
  gulp.watch(['public/jsx/**/*.js', 'public/jsx/**/*.jsx'], ['jsx', 'karma-renderer']);
  gulp.watch(['src/**/*.js'], ['karma-main']);
});
gulp.task('default', ['test', 'build', 'run']);
