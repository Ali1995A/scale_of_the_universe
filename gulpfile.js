const gulp = require("gulp");
const { src, dest } = require('gulp');
const browserify = require("browserify");
const watchify = require("watchify");
const source = require('vinyl-source-stream');
const tsify = require("tsify");
const pipeline = require('readable-stream').pipeline;
const fancy_log = require('fancy-log');
const closureCompiler = require('google-closure-compiler').gulp();
const replace = require('gulp-replace');

const shell = require('gulp-shell')

const uglifyjs = require('uglify-es'); 
const composer = require('gulp-uglify/composer');
const minify = composer(uglifyjs, console);


const paths = {
    pages: ['src/*.html'],
    data: 'src/data/**/*',
    fonts: 'src/fonts/**/*',
    bundle: "dist/js"
};

function createBundler({ watch }) {
  const b = browserify({
    basedir: '.',
    debug: true,
    entries: ['src/ts/main.ts'],
    project: 'tsconfig.json',
    cache: {},
    packageCache: {}
  }).plugin(tsify, {}).on('error', console.log);

  return watch ? watchify(b) : b;
}


gulp.task("copy-html", function (done) {
    return src(paths.pages)
        .pipe(dest("dist"))
});

gulp.task("copy-data", function (done) {
  return src(paths.data)
      .pipe(dest("dist/data"))
});

gulp.task("copy-fonts", function () {
  return src(paths.fonts)
    .pipe(dest("dist/fonts"))
});

gulp.task("serve", function (done) {
  return require('./serve');
});

gulp.task('ghio-deploy', shell.task('sh ghio_deploy.sh'))

gulp.task('compress', function () {
  gulp.src(['dist/index.html'])
    .pipe(replace('js/bundle.js', 'js/bundle.min.js'))
    .pipe(gulp.dest('dist/'));

  return pipeline(
      gulp.src('dist/js/bundle.js'),
      closureCompiler({
        compilation_level: 'SIMPLE',
        language_in: 'ECMASCRIPT6_STRICT',
        language_out: 'ECMASCRIPT5_STRICT',
        // output_wrapper: '(function(){\n%output%\n}).call(this)',
        js_output_file: 'bundle.min.js'
      }, {
        platform: ['native', 'java', 'javascript']
      }),
      minify(),
      gulp.dest('dist/js')
    );
  });
  
function bundle(bundler) {
  return pipeline(
    bundler.bundle()
    .on('error', fancy_log),
    source('bundle.js'),
    dest(paths.bundle)
  );
}

gulp.task("bundle-once", function () {
  const bundler = createBundler({ watch: false });
  return bundle(bundler);
});

gulp.task("bundle-watch", function () {
  const bundler = createBundler({ watch: true });
  bundler.on("update", () => bundle(bundler));
  bundler.on("log", fancy_log);
  return bundle(bundler);
});

gulp.task("watch-static", function () {
  gulp.watch('src/index.html', gulp.parallel(['copy-html']))
  gulp.watch(paths.data, gulp.parallel(['copy-data']))
  gulp.watch(paths.fonts, gulp.parallel(['copy-fonts']))
});

gulp.task("build", gulp.series(["copy-html", "copy-data", "copy-fonts", "bundle-once"]));
gulp.task("build:prod", gulp.series(["build", "compress"]));

gulp.task("dev", gulp.series(
  gulp.parallel(["copy-html", "copy-data", "copy-fonts"]),
  gulp.parallel(["serve", "watch-static", "bundle-watch"])
));

gulp.task("default", gulp.series(["dev"]));
