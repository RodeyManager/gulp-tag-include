/**
 * Created by Rodey on 2015/11/9.
 */

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    clean = require('gulp-clean'),
    htmlIncluder = require('../index');

gulp.task('clean', function() {
    return gulp.src('dist/**/*').pipe(clean({ force: true }));
});

gulp.task('build.html', ['clean'], function() {
    gulp
        .src('src/build.html')
        .pipe(
            htmlIncluder({
                extractCss: 'dist/app.css',
                extractJs: 'dist/app.js'
            })
        )
        .pipe(gulp.dest('dist'));
});

gulp.task('build.tag.html', ['clean'], function() {
    gulp
        .src('src/tag.html')
        .pipe(htmlIncluder())
        .pipe(gulp.dest('dist'));
});

gulp.task('build.tagname.html', ['clean'], function() {
    gulp
        .src('src/tagname.html')
        .pipe(
            htmlIncluder({
                tagName: 'require' //默认 include
            })
        )
        .pipe(gulp.dest('dist'));
});

gulp.task('watch.html', function() {
    gulp.watch('src/**/*.html', ['build.html', 'build.tag.html', 'build.tagname.html']);
});

gulp.task('default', ['build.html', 'build.tag.html', 'build.tagname.html', 'watch.html']);
