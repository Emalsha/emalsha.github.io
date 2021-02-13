var { series, src, dest, watch } = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();

// Set the banner content
var banner = ['/*!\n',
  ' * Emalsha Rasad resume - <%= pkg.title %> v<%= pkg.version %> \n',
  ' * Copyright 2018-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' */\n',
  ''
].join('');

// Copy third party libraries from /node_modules into /vendor
function copyBootstrap() {
  return src([
    './node_modules/bootstrap/dist/**/*',
    '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
    '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
  ])
  .pipe(dest('./vendor/bootstrap'));
}

function copyDevicons() {
  return  src([
    './node_modules/devicons/**/*',
    '!./node_modules/devicons/*.json',
    '!./node_modules/devicons/*.md',
    '!./node_modules/devicons/!PNG',
    '!./node_modules/devicons/!PNG/**/*',
    '!./node_modules/devicons/!SVG',
    '!./node_modules/devicons/!SVG/**/*'
  ])
  .pipe(dest('./vendor/devicons'));
}

function copyFontAwesome() {
  return  src([
    './node_modules/font-awesome/**/*',
    '!./node_modules/font-awesome/{less,less/*}',
    '!./node_modules/font-awesome/{scss,scss/*}',
    '!./node_modules/font-awesome/.*',
    '!./node_modules/font-awesome/*.{txt,json,md}'
  ])
  .pipe(dest('./vendor/font-awesome'));
}

function copyJQuery() {
  return src([
    './node_modules/jquery/dist/*',
    '!./node_modules/jquery/dist/core.js'
  ])
  .pipe(dest('./vendor/jquery'));
}

function copyJQueryEasing() {
  return src([
    './node_modules/jquery.easing/*.js'
  ])
  .pipe(dest('./vendor/jquery-easing'));
}

function copySimpleLineIcons() {
  return src([
    './node_modules/simple-line-icons/fonts/**',
  ])
  .pipe(dest('./vendor/simple-line-icons/fonts'));
}

function copySimpleLineIconsCss() {
  return src([
    './node_modules/simple-line-icons/css/**',
  ])
  .pipe(dest('./vendor/simple-line-icons/css'));
}

const copy = series(copyBootstrap, copyDevicons, copyFontAwesome, copyJQuery, copyJQueryEasing, copySimpleLineIcons, copySimpleLineIconsCss);

// Compile SCSS
function cssCompile() {
  return src('./scss/**/*.scss')
  .pipe(sass.sync({
    outputStyle: 'expanded'
  }).on('error', sass.logError))
  .pipe(dest('./css'));
}

// Minify CSS
function cssMinify() {
  return src([
      './css/*.css',
      '!./css/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(dest('./css'))
    .pipe(browserSync.stream());
}

// CSS
const css = series(cssCompile, cssMinify);

// Minify JavaScript
function jsMinify() {
  return src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(dest('./js'))
    .pipe(browserSync.stream());
}

// JS
const js = series(jsMinify);

// Configure the browserSync task
function browserSyncServe(cb) {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
  cb();
}

function browserSyncReload(cb){
  browserSync.reload();
  cb();
}

// Dev task
function devwatch(){
  watch('./scss/*.scss', css, browserSyncReload);
  watch('./js/*.js',js, browserSyncReload);
  watch('./*.html', browserSyncReload);
}

exports.default = series(copy, css, js);
exports.dev = series(copy, css, js, browserSyncServe, devwatch)