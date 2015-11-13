/**
 * Created by Rodey on 2015/11/9.
 */

var gulp            = require('gulp'),
    watch           = require('gulp-watch'),
    htmlIncluder    = require('../index');

gulp.task('build.html', function(){

    gulp.src('src/build.html')
        .pipe(htmlIncluder())
        .pipe(gulp.dest('dist'));

});

gulp.task('build.tagname.html', function(){

    gulp.src('src/tagname.html')
        .pipe(htmlIncluder({
            tagName: 'require'  //默认 include
        }))
        .pipe(gulp.dest('dist'));

});

gulp.task('watch.html', function(){

    gulp.watch('src/**/*.html', ['build.html', 'build.tagname.html']);

});

gulp.task('default', ['build.html', 'build.tagname.html', 'watch.html']);


