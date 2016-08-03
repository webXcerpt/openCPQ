"use strict";

const Metalsmith	= require("metalsmith");
const m_browserSync	= require('metalsmith-browser-sync');
const m_drafts		= require('metalsmith-drafts');
const m_markdown	= require('metalsmith-markdown');
const m_templates	= require('metalsmith-templates');

const minimist		= require('minimist')
const URIjs			= require('URIjs');

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
	{name: "Embedding", file: "doc/embedding/embedding-openCPQ-configurators.md"},
	{name: "Presentations", file: "presentations.md"},
	{name: "Blog", file: "blog.md"},
	{name: "Source", url: "http://github.com/webXcerpt/openCPQ"},
];

const authors = {
	hs: "Heribert Schütz",
	tg: "Tim Geisler",
};

const groupSpecs = [
	{type: "blog"			, re: /^blog-posts\/.*\.md$/	, cmp: reverseChronological	},
	{type: "demo"			, re: /^demos\/.*\.md$/			, cmp: byURL				},
	{type: "presentation"	, re: /^presentations\/.*\.md$/	, cmp: reverseChronological	},
];
// ----------------------------------------------------------------------
// Plugins, Utilities

function reverseChronological(x,y) { return y.date.getTime() - x.date.getTime(); }
function byURL(x,y) { return x.url > y.url ? 1 : x.url === y.url ? 0 : -1; }

// Actually the precise value of urlPrefix should not matter since all
// internal links in the output should use relative URLs.  It must,
// however, be an absolute URL ending with a slash.
const urlPrefix = "https://webxcerpt.github.io/openCPQ/";

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
	return URIjs(file).absoluteTo(urlPrefix).toString()
		.replace(/\.md$/, ".html");
}

function expandAuthors(author) {
	const authorList = []
	function emit(author) {
		return authorList.push(authors[author] || author);
	}
	if (author == undefined)
		; // do nothing
	else if (author instanceof Array)
		author.forEach(emit);
	else
		emit(author);
	const n = authorList.length;
	switch (n) {
		case 0 : return undefined;
		case 1 : return authorList[0];
		case 2 : return `${authorList[0]} and ${authorList[1]}`;
		default: return `${authorList.slice(0, n-1).join(", ")}, and ${authorList[n-1]}`;
	}
}

function m_extendFileData(files, metalsmith, done) {
	const groups = {};
	for (const file in files) {
		const data = files[file];
		const unixFile = file.replace(/\\/g, "/");
		const url = file2url(unixFile);
		data.url = url;
		data.mkRelative = u => {
			const rel = URIjs(u).relativeTo(url).toString();
			if (rel === "" && u.endsWith("/"))
				// need to fix URIjs result:
				return ".";
			return rel;
		}
		if (data.date)
			data.dateString = data.date.toISOString().substr(0, 10);
		data.author = expandAuthors(data.author);
		data.presenter = expandAuthors(data.presenter);
		data.type = "standard";
		for (const {type, re} of groupSpecs)
			if (re.test(unixFile)) {
				data.type = type;
				var group = groups[type] || (groups[type] = []);
				group.push(data);
				break;
			}
	}
	for (const {type, cmp} of groupSpecs)
		groups[type].sort(cmp);
	metalsmith.metadata({...metalsmith.metadata(), groups});
	done();
}

function m_crlf_line_ending(files, metalsmith, done) {
	for (const file in files)
		if (/\.html$/.test(file)) {
			const data = files[file];
			data.contents = data.contents.toString().replace(/\r?\n|\r/g, "\r\n");
		}
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
		".#*", // Emacs auxiliary files
	])
    .use(m_initialMessage);

if (production)
	metalsmith.use(m_drafts());

if (!production)
	metalsmith.use(m_browserSync({server: outDir, files: ["**/*"]}));

metalsmith
    .use(m_extendFileData)
//	.use(m_log)
	.use(m_templates({engine: 'ejs', inPlace: true}))
	.use(m_markdown({gfm: true}))
	.use(m_templates({engine: 'ejs', inPlace: false, default: "template.html"}))
	.use(m_crlf_line_ending)
	.use(m_finalMessage)
	.build(err => {
		if (err)
			throw err;
	});