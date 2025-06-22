const gulp = require('gulp');
const concat = require('gulp-concat-css');
const plumber = require('gulp-plumber');
const del = require('del');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mediaquery = require('postcss-combine-media-query');
const cssnano = require('cssnano');
const htmlMinify = require('html-minifier');
const replace = require('gulp-replace');

function serve() {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
  });
}

function html() {
  const options = {
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true,
    minifyCSS: true,
    keepClosingSlash: true,
  };
  return gulp
    .src('src/**/*.html')
    .pipe(plumber())
    .pipe(
      replace(
        /<link rel="stylesheet" href="\.\/(fonts\/fonts\.css|styles\/variables\.css|styles\/globals\.css|styles\/style\.css|styles\/animations\.css)" \/>/g,
        ''
      )
    )
    .pipe(
      replace(
        /(<\/head>)/,
        '  <link rel="stylesheet" href="./styles.css" />\n$1'
      )
    )
    .on('data', function (file) {
      const buferFile = Buffer.from(
        htmlMinify.minify(file.contents.toString(), options)
      );
      return (file.contents = buferFile);
    })
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({ stream: true }));
}

function css() {
  const plugins = [autoprefixer(), mediaquery(), cssnano()];
  return gulp
    .src([
      'src/fonts/fonts.css',
      'src/styles/variables.css',
      'src/styles/globals.css',
      'src/styles/style.css',
      'src/styles/animations.css',
    ])
    .pipe(plumber())
    .pipe(concat('styles.css'))
    .pipe(postcss(plugins))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({ stream: true }));
}

function scripts() {
  return gulp
    .src('src/scripts/**/*.js')
    .pipe(gulp.dest('dist/scripts'))
    .pipe(browserSync.reload({ stream: true }));
}

function images() {
  return gulp
    .src('src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}')
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.reload({ stream: true }));
}

function svgs() {
  return gulp
    .src('src/svg/**/*.svg')
    .pipe(gulp.dest('dist/svg'))
    .pipe(browserSync.reload({ stream: true }));
}

function fonts() {
  return gulp
    .src('src/fonts/**/*.{woff,woff2,ttf,eot,otf}')
    .pipe(gulp.dest('dist/fonts'))
    .pipe(browserSync.reload({ stream: true }));
}

function clean() {
  return del('dist');
}

function watchFiles() {
  gulp.watch(['src/**/*.html'], html);
  gulp.watch(['src/**/*.css'], css);
  gulp.watch(['src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}'], images);
}

const build = gulp.series(
  clean,
  gulp.parallel(html, css, images, svgs, fonts, scripts)
);
const watchapp = gulp.parallel(build, watchFiles, serve);

exports.html = html;
exports.css = css;
exports.scripts = scripts;
exports.images = images;
exports.svgs = svgs;
exports.fonts = fonts;
exports.clean = clean;

exports.build = build;
exports.watchapp = watchapp;
exports.default = watchapp;
