"use strict";

const Metalsmith	= require("metalsmith");
const m_drafts		= require('metalsmith-drafts');
const m_markdown	= require('metalsmith-markdown');
const m_templates	= require('metalsmith-templates');
const m_serve		= require('metalsmith-serve');
const m_watch		= require('metalsmith-watch');
const minimist = require('minimist')

// ----------------------------------------------------------------------
// Configuration

const args = minimist(process.argv.slice(2), {boolean: ["prod"]});
console.dir(args);

const production = args.prod;

const inDir  = "src";
const outDir = production ? ".." : "test-output";

const logo = "images/openCPQ-logo-425x175.png";

const navigation = [
	{name: "Home", file: "index.html"},
	{name: "Tutorial", file: "doc/tutorial.md"},
	{name: "Blog", file: "blog.md"},
	{name: "Source", url: "http://github.com/webXcerpt/openCPQ"},
];

const blogRegExp = /^blog-posts\/.*\.md$/;

const urlPrefix = production ? "https://webxcerpt.github.io/openCPQ/" : "/";

// ----------------------------------------------------------------------
// Plugins, Utilities

function m_log(files, metalsmith, done) {
	console.log(JSON.stringify(
		files,
		(k,v) =>
			k === "data" && v instanceof Array
			? String.fromCharCode.apply(
				null, new Uint16Array(v.slice(0, 50))) + "..."
			: v,
		2));
	done();
}

function file2url(file) {
	return (urlPrefix + file)
		.replace(/\.md$/, ".html")
		.replace(/\/index\.html$/, "/");
}

function m_collectBlogs(files, metalsmith, done) {
	const blogFile = files["blog.md"];
	// Do nothing if blog.md is not being processed, e.g. upon
	// "watch"-triggered reprocessing of another file:
	if (blogFile) {
		var blogList = [];
		for (const file of Object.keys(files)) {
			if (blogRegExp.test(file)) {
				const {date, title, teaser} = files[file];
				blogList.push({date, title, teaser, url: file2url(file)});
			}
		}

		blogFile.blogList =
			blogList.sort((x,y) => y.date.getTime() - x.date.getTime());
	}
	done();
}

function m_assignURLs(files, metalsmith, done) {
	for (const file in files)
		files[file].url = file2url(file);
	done();
}

function m_initialMessage(files, metalsmith, done) {
	console.log(`Input files:`);
	for (const file in files)
		console.log(`- ${inDir}/${file}${files[file].draft ? " [draft]": ""}`);
	done();
}

function m_finalMessage(files, metalsmith, done) {
	console.log(`Output files:`);
	for (const file in files)
		console.log(`- ${outDir}/${file}`);
	if (production)
		console.log(`
Old files in "${outDir}" are not removed automatically.
Remove them manually as needed.
`);
	done();
}

// ----------------------------------------------------------------------
// Processing Chain

const metalsmith = Metalsmith(__dirname)
	.clean(!production)
	.metadata({
		production,
		rootUrl: urlPrefix,
		logo: file2url(logo),
		navigation: navigation.map(
			entry => ({
				...entry,
				url: entry.url || file2url(entry.file)
			})
		)
	})
	.source(inDir)
	.destination(outDir)
	.ignore([
		"*~", // Emacs' backup files
		".#*", // Emacs' auxiliary files
	])
    .use(m_initialMessage);

if (production)
	metalsmith.use(m_drafts());
else
	metalsmith.use(m_watch({
		livereload: true,
		paths: {
			// New/modified blog posts should also rebuild the blog-list page.
			// TODO Make this work (using blogRegExp?).
			//   "${source}/blog-posts/*": "${source}/blog.md",

			// Rebuild a file when it changes.
			"${source}/**/*": true,

			// Rebuild everything when the template changes:
			"templates/template.html": "**/*",
		}
	}));

metalsmith
    .use(m_assignURLs)
	.use(m_collectBlogs)
	.use(m_templates({engine: 'ejs', inPlace: true}))
	.use(m_markdown({gfm: true}))
//	.use(m_log)
	.use(m_templates({engine: 'ejs', inPlace: false, default: "template.html"}))
    .use(m_finalMessage);

if (!production)
	metalsmith.use(m_serve({verbose: true}));

metalsmith
	.build(err => {
		if (err)
			throw err;
	});
