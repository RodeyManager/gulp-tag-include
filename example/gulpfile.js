/**
 * Created by Rodey on 2015/11/9.
 */

const { series, parallel, src, dest } = require('gulp');
const gulpClean = require('gulp-clean');
const htmlIncluder = require('../index');

function clean() {
  return src('dist/**/*').pipe(gulpClean({ force: true }));
}

function build() {
  return src('src/build.html')
    .pipe(
      htmlIncluder({
        extractCss: 'dist/app.css',
        extractJs: 'dist/app.js'
      })
    )
    .pipe(dest('dist'));
}

function tag() {
  return src('src/tag.html').pipe(htmlIncluder()).pipe(dest('dist'));
}

function tagname() {
  return src('src/tagname.html')
    .pipe(
      htmlIncluder({
        tagName: 'require' //默认 include
      })
    )
    .pipe(dest('dist'));
}

function globals() {
  return src('src/globals.html')
    .pipe(
      htmlIncluder({
        globals: {
          token: 'AKDDAWWDKASD992323'
        }
      })
    )
    .pipe(dest('dist'));
}

exports.default = series(clean, parallel(build, tag, tagname, globals));

// gulp.task('clean', function () {
//   return gulp.src('dist/**/*').pipe(clean({ force: true }));
// });

// gulp.task('build.html', ['clean'], function () {
//   gulp
//     .src('src/build.html')
//     .pipe(
//       htmlIncluder({
//         extractCss: 'dist/app.css',
//         extractJs: 'dist/app.js'
//       })
//     )
//     .pipe(gulp.dest('dist'));
// });

// gulp.task('build.tag.html', ['clean'], function () {
//   gulp.src('src/tag.html').pipe(htmlIncluder()).pipe(gulp.dest('dist'));
// });

// gulp.task('build.tagname.html', ['clean'], function () {
//   gulp
//     .src('src/tagname.html')
//     .pipe(
//       htmlIncluder({
//         tagName: 'require' //默认 include
//       })
//     )
//     .pipe(gulp.dest('dist'));
// });

// gulp.task('build.globals.html', ['clean'], function () {
//   gulp
//     .src('src/globals.html')
//     .pipe(
//       htmlIncluder({
//         globals: {
//           token: 'AKDDAWWDKASD992323'
//         }
//       })
//     )
//     .pipe(gulp.dest('dist'));
// });

// gulp.task('watch.html', function () {
//   gulp.watch('src/**/*.html', [
//     'build.html',
//     'build.tag.html',
//     'build.tagname.html',
//     'build.globals.html'
//   ]);
// });

// gulp.task('default', [
//   'build.html',
//   'build.tag.html',
//   'build.tagname.html',
//   'build.globals.html',
//   'watch.html'
// ]);
