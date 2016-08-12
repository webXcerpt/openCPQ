"use strict";

var path = require("path");

var config = {
	target: "web",
	entry: [].concat(
		"!file-loader?name=index.html&context=./src!./src/index.html",
		"./src/index.js"
	),
	output: {
		path: path.resolve("dst"),
		filename: "bundle.js",
		pathinfo: true,
	},
	module: {
		loaders: [
			{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
		]
	},
	debug: true,
	devtool: "source-map",
	progress: true,
};

module.exports = config;
