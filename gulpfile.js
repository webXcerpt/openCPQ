var gulp		= require('gulp');
var gulpif		= require('gulp-if');
var sourcemaps	= require('gulp-sourcemaps');
var babel		= require('gulp-babel');
var chain		= require('gulp-chain');
var rimraf		= require('rimraf');

var outDir = "dst";

gulp.task('clean', function(cb) {
	rimraf(outDir, cb);
});

gulp.task('default', ['clean'], function () {
    return gulp
		.src('src/**/*')
        .pipe(gulpif(
			function(file) { return file.path.endsWith(".js"); },
			chain(function(stream) {
				return stream
					.pipe(sourcemaps.init())
					.pipe(babel({stage: 0}))
					.pipe(sourcemaps.write('maps'));
			})()
		))
        .pipe(gulp.dest(outDir));
});
