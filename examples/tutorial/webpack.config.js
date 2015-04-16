"use strict";

var manifestCacheEntries = [];

var resources = require("glob").sync("./resources/**", {nodir: true}).map(function(file) {
	return "!file?name=[path][name].[ext]&context=.!" + file;
});

// ----------------------------------------------------------------------

var path = require("path");
var webpack = require("webpack");
var AppCachePlugin = require('appcache-webpack-plugin');

var args = require("minimist")(process.argv.slice(2));

var debug = !(args.production || args.p);

var config = {
	target: "web",
	entry: {
		"index.html": "!file?name=[path][name].[ext]&context=.!./index.html",
		resources: resources,
		bundle: [
			"bootstrap/less/bootstrap.less",
			"./step-1.js",
		],
	},
	output: {
		path: path.resolve("dist"),
		filename: "bundle.js",
	},
	module: {
		loaders: [
			{ test: /\.js$/, loader: "babel?stage=0" },
			{ test: /\.json$/, loader: "json" },
			{ test: /\.css$/, loader: "style!css" },
			{ test: /\.less$/, loader: "style!css!less" },
			{ test: /\.(eot|svg|ttf|woff2?)$/, loader: "url?limit=10000" },
			{ test: /\.png$/, loader: "url-loader?mimetype=image/png" },
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			DEBUG: debug,
		}),
	],
	progress: true,
};

if (debug) {
	config.output.pathinfo = true;
	config.debug = true;
	config.devtool = "source-map";
}
else {
	// We use a cache manifest only in production mode.  In debug mode
	// it would interfere with reloads after source changes.
	config.plugins.push(
		// The cache manifest goes to the hard-wired filename "manifest.appcache".
		new AppCachePlugin({
			cache: ['.'].concat(manifestCacheEntries),
			network: ['http://*', 'https://*', '*'],
			settings: ["prefer-online"],
		})
	);
}

module.exports = config;
