"use strict";

const Metalsmith	= require("metalsmith");
const m_drafts		= require('metalsmith-drafts');
const m_markdown	= require('metalsmith-markdown');
const m_templates	= require('metalsmith-templates');
const m_serve		= require('metalsmith-serve');
const m_watch		= require('metalsmith-watch');
const minimist		= require('minimist')

// ----------------------------------------------------------------------
// Configuration

const args = minimist(process.argv.slice(2), {boolean: ["prod"]});

const production = args.prod;

const inDir  = "src";
const outDir = production ? ".." : "test-output";

const logo = "images/openCPQ-logo-425x175.png";

const navigation = [
	{name: "Home", file: "index.html"},
	{name: "Demos", file: "demos.md"},
	{name: "Tutorial", file: "doc/tutorial.md"},
	{name: "Presentations", file: "presentations.md"},
	{name: "Blog", file: "blog.md"},
	{name: "Source", url: "http://github.com/webXcerpt/openCPQ"},
];

const authors = {
	hs: "Heribert Schütz",
	tg: "Tim Geisler",
};

const typeRegExps = {
	blog: /^blog-posts\/.*\.md$/,
	demo: /^demos\/.*\.md$/,
	presentation: /^presentations\/.*\.md$/,
};

const typeIsDateSorted = type => type !== "demo";

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

// Convert a source file path (relative to inDir) to the URL at which
// the generated file will be available.
function file2url(file) {
	return (urlPrefix + file)
		.replace(/\.md$/, ".html")
		.replace(/\/index\.html$/, "/");
}

function m_extendFileData(files, metalsmith, done) {
	const groups = {};
	for (const file in files) {
		const data = files[file];
		const unixFile = file.replace(/\\/g, "/");
		data.url = file2url(unixFile);
		if (data.date)
			data.dateString = data.date.toISOString().substr(0, 10);
		if (data.author)
			data.authorName = authors[data.author];
		files[file].type = "standard";
		for (const type in typeRegExps)
			if (typeRegExps[type].test(unixFile)) {
				files[file].type = type;
				var list = groups[type] || (groups[type] = []);
				list.push(data);
				break;
			}
	}
	for (const type in groups)
		if (typeIsDateSorted(type))
			groups[type].sort((x,y) => y.date.getTime() - x.date.getTime());
	metalsmith.metadata({...metalsmith.metadata(), groups});
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
		"npm-debug.log",
		"*~", // Emacs backup files
		".#*", // Emacs auxiliary files (But "watch" still crashes with
			   // these files, which are symbolic links pointing
			   // nowhere.  Ignoring happens too late.)
	])
    .use(m_initialMessage);

if (production)
	metalsmith.use(m_drafts());

if (!production)
	metalsmith.use(m_watch({
		livereload: true,
		paths: {
			// Rebuild a file when it changes:
			"${source}/**/*": true,

			// Rebuild everything when the template changes:
			"templates/template.html": "**/*",
		}
	}));

metalsmith
    .use(m_extendFileData)
//	.use(m_log)
	.use(m_templates({engine: 'ejs', inPlace: true}))
	.use(m_markdown({gfm: true}))
	.use(m_templates({engine: 'ejs', inPlace: false, default: "template.html"}))
    .use(m_finalMessage);

if (!production)
	metalsmith.use(m_serve({verbose: true}));

metalsmith
	.build(err => {
		if (err)
			throw err;
	});
