var {src, dest} = require("gulp");
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var del = require('del');
var pug = require('gulp-pug');
var htmlmin = require('gulp-htmlmin');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var log = require('gulplog');
var terser = require('gulp-terser');
var babelify = require('babelify');
var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var cheerio = require('gulp-cheerio');
var replace = require('gulp-replace');
var purgecss = require('gulp-purgecss');


var path = {
  build: {
    home: "dist/",
    pages: "dist/pages",
    css: "dist/",
    js: "dist/",
    favicons: "dist/images/favicons",
    img: "dist/images/img",
    svg: "dist/images/svg",
    sprite: "dist/images/svg",
    fonts: "dist/fonts"
  },
  src: {
    html: "src/**/*.pug",
    css: "src/**/*.scss",
    js: "src/**/*.js",
    favicons: "src/images/favicons/favicon.png",
    img: "src/images/img/**/*.{png,jpg}",
    svg: "src/images/svg/**/*.svg",
    sprite: "dist/images/svg/icon-*.svg",
    fonts: "src/fonts/**/*.*"

  },
  watch: {
    html: "src/**/*.pug",
    css: "src/**/*.scss",
    js: "src/**/*.js",
    favicons: "src/images/favicons/*.png",
    img: "src/images/img/**/*.{png,jpg}",
    svg: "src/images/svg/**/*.svg",
    fonts: "src/fonts/**/*.*"
  },
  clean: "./dist"
}

var FAVICON_DATA_FILE = 'faviconData.json';

function generateFavicons(done) {
  realFavicon.generateFavicon({
    masterPicture: path.src.favicons,
    dest: path.build.favicons,
    iconsPath: '/images/favicons',
    design: {
        ios: {
            pictureAspect: 'noChange',
            assets: {
                ios6AndPriorIcons: false,
                ios7AndLaterIcons: false,
                precomposedIcons: false,
                declareOnlyDefaultIcon: true
            }
        },
        desktopBrowser: {
          design: 'raw'
        },
        windows: {
            pictureAspect: 'noChange',
            backgroundColor: '#da532c',
            onConflict: 'override',
            assets: {
                windows80Ie10Tile: false,
                windows10Ie11EdgeTiles: {
                    small: true,
                    medium: true,
                    big: true,
                    rectangle: false
                }
            }
        },
        androidChrome: {
            pictureAspect: 'noChange',
            themeColor: '#ffffff',
            manifest: {
                display: 'standalone',
                orientation: 'notSet',
                onConflict: 'override',
                declared: true
            },
            assets: {
                legacyIcon: false,
                lowResolutionIcons: false
            }
        },
        safariPinnedTab: {
          pictureAspect: 'silhouette',
          themeColor: '#5bbad5'
        }
    },
    settings: {
        compression: 5,
        scalingAlgorithm: 'Mitchell',
        errorOnImageTooSmall: false,
        readmeFile: false,
			  htmlCodeFile: false,
    },
    markupFile: FAVICON_DATA_FILE
}, function() {
    done();
});
}

function html() {
  return src(path.src.html, {base: "src/"})
  .pipe(plumber())
  .pipe(pug())
  .pipe(posthtml([
    include()
  ]))
  .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(dest(path.build.home));
}

function css() {
  return src(path.src.css, {base: "src/"})
  .pipe(plumber())
  .pipe(sass())
  .pipe(sourcemaps.init())
  .pipe(autoprefixer({
    cascade: true
  }))
  .pipe(csso({
    debug: true,
    comments: false
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(dest(path.build.css));
}

function cleancss() {
  return src('dist/**/*.css')
  .pipe(plumber())
  .pipe(purgecss({
    content: ['dist/**/*.html']
  }))
  .pipe(gulp.dest('dist/'));
}

function js() {
          return browserify({ entries: 'src/index.js'})
          .transform(babelify, { presets: ['@babel/preset-env'] })
          .bundle()
          .pipe(plumber())
          .pipe(source('index.js'))
          .pipe(buffer())
          .pipe(sourcemaps.init({loadMaps: true}))
          .pipe(terser())
          .on('error', log.error)
          .pipe(sourcemaps.write("./"))
          .pipe(dest(path.build.js));
}

function img() {
  return src(path.src.img)
          .pipe(plumber())
          .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
          ]))
          .pipe(webp())
          .pipe(dest(path.build.img));
}

function svgMin() {
  return src(path.src.svg)
  .pipe(plumber())
  .pipe(svgmin({
    // js2svg: {
    //   pretty: true
    // }
  }))
  .pipe(cheerio({
    run: function ($) {
      $('[fill]').removeAttr('fill');
      $('[stroke]').removeAttr('stroke');
      $('[style]').removeAttr('style');
    },
    parserOptions: {xmlMode: true}
  }))
  .pipe(replace('&gt;', '>'))
  .pipe(dest(path.build.svg));
}

function sprite() {
  return src(path.src.sprite)
  .pipe(plumber())
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("sprite.svg"))
  .pipe(dest(path.build.sprite));
}

function fonts() {
  return src(path.src.fonts)
  .pipe(plumber())
  .pipe(dest(path.build.fonts));
}

function clean() {
  return del(path.clean);
}

function watchFiles() {
  gulp.watch([path.watch.favicons], generateFavicons);
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], img);
  gulp.watch([path.watch.svg], svgMin);
  gulp.watch([path.watch.fonts], fonts);
}

const build = gulp.series(clean, /*generateFavicons,*/ gulp.parallel(html, css, js, img, svgMin, fonts, cleancss, sprite));
const watch = gulp.parallel(build, watchFiles);

exports.html = html;
exports.css = css;
exports.jsss = js;
exports.generateFavicons = generateFavicons;
exports.img = img;
exports.svgMin = svgMin;
exports.sprite = sprite;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
