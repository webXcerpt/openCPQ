"use strict";

var pkg = require("./package.json");
var deployment = require("./deployment.json");
var gulp = require('gulp');
var ftp = require('vinyl-ftp');
var gutil = require('gulp-util');
var del = require('del');

// TODO delete or clear remote folder before copying
gulp.task('ftp', function () {
    var conn = ftp.create({
        host: deployment.host,
        user: deployment.user,
        password: deployment.password,
        parallel: 10,
        log: gutil.log
    });

    return gulp.src(['dist/**', '.htaccess'], { buffer: false })
        .pipe(conn.dest(deployment.folder + pkg.name))
});

gulp.task('clean', function(cb) {
	del(["node_modules", "npm-debug.log", "dist", "{.,src}/*~"], cb);
});
