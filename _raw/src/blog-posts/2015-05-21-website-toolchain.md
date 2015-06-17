---
date: 2015-05-21
author: hs
title: The Tool Chain for Building This Website
teaser: >
  Which tools we selected and how they are similar to openCPQ.
---

The Tool Chain for Building This Website
========================================

Since the source code for openCPQ is hosted at GitHub, it was natural to
use GitHub Pages for the openCPQ website.  And of course we want some
preprocessing for our pages: Convert Markdown to HTML, add a navigation
bar, and so on.  GitHub provides Jekyll-based preprocessing for these
tasks.  The nice thing is that you just commit the "raw" files (+ Jekyll
configuration and templates) and GitHub Pages will run Jekyll
automatically.

But there were two problems:
- Occasionally we want some custom processing which Jekyll does not
  provide out of the box.  And of course GitHub cannot allow us to tweak
  their Jekyll setup much because that would be a major security risk.
- We want to check the results before committing pages.  So we have to
  be able to run Jekyll ourselves.  And that requires us to install (and
  possibly tweak) a Ruby-based tool chain.  In principle there's nothing
  wrong with Ruby, but we prefer something based on JavaScript and Node
  since we are familiar with these tools.


Processing Framework
--------------------

One possible approach is to write a node.js script converting the raw
pages into the final web site.  This requires not that much code since
one would of course use third-party npm packages for tasks like markdown
processing or templating.  However you have to learn the APIs of all
these packages to wire them together properly.  An existing processing
framework might be an easier approach.

So I had a brief look at some of the highest-rated JS-based tools at
[StaticGen](https://www.staticgen.com/):
- **Hexo** looks like being too specialized in blogs.  (Furthermore it
  uses a command line interface for managing the input directory
  structure.  I don't know how often this would have to be used,
  however.)
- **Brunch** is a build tool apparently competing with
  Gulp/Grunt/Webpack/...  It might be better at creating static web
  pages but has quite some focus on web applications.
- **Metalsmith** is quite bare-bones, but very powerful and extensible.
- **Harp** provides quite some functionality out of the box, but seems
  to have no plugin/extensibility concept.  Also does not support "front
  matter", which is convenient for blogs.
- **HubPress** is oriented towards GitHub Pages.  But it seems to
  concentrate on an authoring UI.

(Of course I spent only some limited amount of time on each of these
tools.  So I might have missed some important points.  In particular if
the tool's web site primarily advertised one feature, I might have got
the wrong impression that some other feature is missing or not
well-supported.)

Some of these tools have features that we don't need or even don't want.
We want to write content with our favorite editors, not with a
tool-provided editor.  The same goes for the directory structure of the
raw files: We simply want to put files in the appropriate places and
don't want to learn how to manage the directory hierarchy with some
tools.  We simply need a transformation from an input directory to an
output directory.

On the other hand, some of the provided features were interesting, even
though they were not on our initial requirements list.  In particular
automatic rebuilds and browser reloads upon input-file updates would be
very useful.

Of the tools mentioned above I have chosen **Metalsmith**.  With
Metalsmith I still have to write my own node.js script.  But there are
many Metalsmith plugins wrapping third-party npm packages:
- markdown-to-html transformation,
- templating engines,
- watching for input changes and reprocessing the changed files,
- an HTTP server for viewing the output files (with livereload),
  <br>
  [**Update:** The Browsersync plugin is even more comfortable to use.]
- ...

This makes it a lot easier to use these packages.  With Metalsmith you
just define a sequence of plugins.  Metalsmith reads the contents of the
input directory into a data structure, applies each plugin on it in
turn, and finally writes the resulting files to the output directory.

It is also trivial to hook into the processing chain:
- Since the chain is set up programmatically in JavaScript, you can,
  e.g., create different chains for test and production modes.
- It is also extremely easy to implement ad-hoc plugins for some custom
  processing.

Notice that this is very similar to openCPQ, where JavaScript is also
used to combine components and to implement additional components.

With Jekyll I did some experiments to figure out how templating in
markdown files is handled: Are the templates applied to the markdown
text, resulting in expanded markdown, which is then converted to HTML?
Or is the markdown-with-templates converted to HTML-with-templates and
the templates are expanded there?  (I don't remember the answer.)  With
Metalsmith you just define the processing chain as you need it.

Some (minor) drawbacks of Metalsmith are:
- Many plugins are scarcely documented.  But since they are usually just
  thin wrappers around third-party packages, it is not too hard to RTFS.
- If at some time we have a huge amount of data, how difficult/easy will
  it be to avoid loading everything into memory at once?
- The plugin API is procedural (modifying a state) rather than
  functional (mapping input to output).  This simplifies certain tasks,
  but other tasks might be easier to achieve with a functional approach.
  For example, properly maintaining a site map is not easy when
  Metalsmith's watch plugin reprocesses changed files incrementally.  I
  could imagine that this would be easier to achieve with a functional
  API, but I didn't try this.  In the end, the API style is also a
  matter of taste.
- Even though watching and livereload are not completely reliable when
  there is no 1:1 correspondence between input and output files, the
  feature is nevertheless very helpful for authoring pages.  But
  webpack's approach displaying the actual application in a frame and
  triggering reloads from a parent frame is even better: With webpack
  the automatic reload feature "survives" a restart of the build
  process, whereas with Metalsmith it doesn't.
  <br>
  [**Update:** With the Browsersync plugin cross references work well,
  albeit at the cost that the entire site is rebuilt very frequently.
  However, this is not a problem with our small site.]

Another argument in favor of **webpack** would be that we are already
using it for building openCPQ applications.  (And being able to
`require(...)` not only JS code is also cool.)  It didn't appear easy,
however, to tweak webpack into a static website preprocessor.  A
webpack-based solution can be found at
http://braddenver.com/blog/2015/react-static-site.html, but this is
quite complex.


Templating
----------

We need some templating tool for creating our web pages.  My first idea
was to use **React** since we already know it from openCPQ.  And React
is also readily supported by Metalsmith.  However here are the reasons
why I did not do this:
- React is DOM-oriented rather than text-oriented.  So it is not a good
  tool for templating in markdown files.
- We intend to use React and openCPQ for examples in the documentation.
  It might be confusing if we use the same syntax for preprocessing
  pages.  With a different tool and a different syntax it is probably
  easier to figure out which templates are expanded at which stage.

For now we are using **EJS**.  It is not just implemented in JavaScript,
but also its template language is based on JavaScript, which makes it
powerful and easy to learn at the same time.  While EJS has built-in
HTML escaping for `<%%= ... %>` tags, this is not mandatory: Just use
`<%%- ... %>` instead.

As any template system, EJS allows to repeatedly emit a pattern filled
in with different data.  For openCPQ examples we also have the inverse
task: We want to emit the same data (the example code) with two
different patterns (once to execute the code and once to run it).  I
don't see a straight-forward solution how to implement this with EJS.
Maybe it is best to implement this functionality as a plugin for the
markdown processor.  (But since we are not the first ones with the
requirement that example code should be both executed and displayed, one
might hope for an existing third-party solution.  Is there something
reusable?)


Modern JavaScript
-----------------

In the openCPQ development we have become used to the modern JavaScript
features provided by babeljs and we don't want to miss this in the
website preprocessor code.  This is easily achieved by running the
scripts in `babel-node` instead of `node`.


Managing Input and Output in GitHub
-----------------------------------

The output files have to go to the `gh-pages` branch of the openCPQ
repository to be accessible as GitHub Pages.  The output directory must
be merged into the root directory of that branch.

And of course we also want to manage our input files (including the
build script) in GitHub just as we do it with our source code.  We put
them into subdirectory `_raw` of the `gh-pages` branch.  Since the
directory name starts with an underscore the raw pages do do not appear
as GitHub Pages (but that would not really hurt anyway).
