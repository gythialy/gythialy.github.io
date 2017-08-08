var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
// var htmlclean = require('gulp-htmlclean');
let cleanCSS = require('gulp-clean-css');

// 压缩 public 目录 css
gulp.task('minify-css', function () {
    return gulp.src('./public/**/*.css')
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./public'));
});
// 压缩 public 目录 html
gulp.task('minify-html', function () {
    return gulp.src('./public/**/*.html')
        // .pipe(htmlclean())
        .pipe(htmlmin({
            // removeComments: true,
            collapseWhitespace: true,
            // minifyJS: true,
            // minifyCSS: true,
            // minifyURLs: true,
        }))
        .pipe(gulp.dest('./public'))
});
// 压缩 public/js 目录 js
gulp.task('minify-js', function () {
    function createErrorHandler(name) {
        return function (err) {
            console.error('Error from ' + name + ' in compress task', err.toString());
        };
    }

    return gulp.src('./public/**/*.js')
        .pipe(uglify().on('error', createErrorHandler('gulp.dest')))
        .pipe(gulp.dest('./public'));
});
// 执行 gulp 命令时执行的任务
gulp.task('default', [
    'minify-html',
    // 'minify-css',
    // 'minify-js'
]);