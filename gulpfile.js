var gulp		= require('gulp');
var watch		= require('gulp-watch');
var gulpif		= require('gulp-if');
var sourcemaps	= require('gulp-sourcemaps');
var babel		= require('gulp-babel');
var chain		= require('gulp-chain');
var rimraf		= require('rimraf');

var outDir = "dst";

gulp.task('clean', function(cb) {
	rimraf(outDir, cb);
});

function transform(doWatch) {
	var pipeline = gulp.src('src/**/*');
	if (doWatch)
		pipeline = pipeline.pipe(watch('src/**/*'));
	pipeline = pipeline
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
    return pipeline;
}

gulp.task('default', ['clean'], function () {
    return transform(false);
});

gulp.task('watch', ['clean'], function() {
	return transform(true);
});
