"use strict";

var manifestCacheEntries = ['http://code.jquery.com/jquery-2.1.3.min.js'];

var resources = require("glob").sync("./resources/**", {nodir: true}).map(function(file) {
	return "!file?name=[path][name].[ext]?[hash]&context=.!" + file;
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
		"index.html": "!file?name=[path][name].[ext]?[hash]&context=./src!./src/index.html",
		resources: resources,
		bundle: [
			"bootstrap/less/bootstrap.less",
			"./src/index.js",
		],
	},
	output: {
		path: path.resolve("dist"),
		filename: "bundle.js",
	},
	module: {
		loaders: [
			{ test: /\.js$/, loader: "babel?stage=0" },
			{ test: /\.css$/, loader: "style!css" },
			{ test: /\.less$/, loader: "style!css!less" },
			{ test: /\.(eot|svg|ttf|woff2?)$/, loader: "url?limit=10000" },
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
			cache: ['/'].concat(manifestCacheEntries),
			network: ['http://*', 'https://*', '*',
					  // Hack to get a SETTINGS section, which is not supported by the plugin:
					  // (Must be appended to the last emitted (non-empty) section.)
					  "\nSETTINGS:\nprefer-online"],
		})
	);
}

module.exports = config;
