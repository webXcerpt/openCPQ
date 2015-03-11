"use strict";

var jsMain = "./step-1.js";


var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require("babelify");
var source = require('vinyl-source-stream');
var connect = require('gulp-connect');


function scripts(watch) {
	var bundler = browserify(jsMain, {
		basedir: __dirname,
		debug: true,
		cache: {}, // required for watchify
		packageCache: {}, // required for watchify
		fullPaths: watch // required to be true only for watchify
	});
	if (watch)
		bundler = watchify(bundler);
	bundler.transform(babelify.configure({experimental: true}));
	bundler.on('update', rebundle);
	
	function rebundle() {
		return bundler.bundle()
			.on('error', gutil.log.bind(gutil, 'Browserify Error'))
			.on('end', function() { gutil.log('Browserify Success') })
			.pipe(source('bundle.js'))
			.pipe(gulp.dest('.'))
			.pipe(connect.reload());
	}

	return rebundle();
}

gulp.task('scripts', function() {
	return scripts(false);
});

gulp.task('watch', function() {
	return scripts(true);
});

gulp.task('webserver', function() {
	connect.server({
		livereload: true
	});
});

gulp.task('default', ["webserver", "watch"], function() {});
