---
title: Tutorial
prio: 1
---

openCPQ Tutorial
================

<!-- TODO
What existing knowledge to expect from the reader?
- JS, including new features
- popular utilities for web applications such as node, npm, babel,
  gulp
  - react?
- anything about CPQ, modeling, ...?
-->

Getting started
---------------

### Global Software Requirements

For using openCPQ and for running the example code of this tutorial you
need to have certain utilities from the nodejs ecosystem installed.  Get
the npm package manager from [npmjs.com](http://npmjs.com).  Then use
npm to install the JavaScript preprocessor [babel](http://babeljs.io)
and the build utility [gulp](http://gulpjs.com):

```
npm install --global babel gulp
```

While openCPQ requires babel for compiling new JavaScript features into
a JavaScript version understood by older browsers, you may replace gulp
with another build tool.


### The Project Directory

If you have cloned the openCPQ repository the directory
[examples/tutorial](http://github.com/openCPQ/openCPQ/tree/master/examples/tutorial)
will contain a simple openCPQ application with a basic project setup:

- package.json: configuration for `npm` and other utilities
- gulpfile.js: configuration for `gulp`
- index.html: the HTML file to view
- style.css: some styling
- step-*n*.js: the models, i.e., the configuration logic for the various
  steps of this tutorial

The following directory entries will be created automatically:

- node_modules/: a subdirectory holding opencpq and other modules it
  depends on
- bundle.js: a JavaScript file composed of the step

`cd` into the examples/tutorial directory.  Then run

```
npm install
```

to install openCPQ and other required packages (as declared in
package.json) in the subdirectory node_modules.

Finally, in the same directory run

```
gulp
```

without specifying a task name.  The default task will

- combine JavaScript code from the application and libraries into a file
  `bundle.js`, which is referenced by the HTML file `index.html`,
- repeat this whenever one of the included files changes, and
- start a web server at `http://localhost:8080/`.

Point your browser to [`http://localhost:8080/`](http://localhost:8080/) and if
all went well you see a very simple configurator for a book case.

It is not really necessary that gulp starts a web server.  You can also
open `index.html` with your browser via its `file:` url.  However, the
server provides a convenience for developers: It tells your browser to
refresh a page whenever it is updated.  For this to work, your browser
must support [livereload](http://livereload.com).

<!-- TODO
Out-of the box
-->


The First Example: A Book-Case
------------------------------

Now let's have a look at `step-1.js`, actually at the definition of the
`model` variable.  (Consider the rest of the file as boilerplate code
for now.  We will come back to this later.)

<!-- TODO
Should I explain what a model is?  Or can we expect the reader to know
this?

Avoid confusion with ERP materials.
-->

The model consists of several parameters: The material, dimensions, and
a number of shelves.  They are passed to `CGroup` as an array of
`cmember` invocations.  `cmember` takes

- a name of the group member for internal usage,
- a label of the member to be displayed in the user interface,
- and a "widget" to hold the actual parameter value.

The widget for entering numbers is `CInteger`.  Here a default value is
provided as an option parameter.

The `CSelect` widget translates to a dropdown menu with the selectable
cases passed as an array of `ccase` invocations.  Like `cmember`,
`ccase` takes an argument for naming the case internally and a label to
appear in the user interface.  Your internal names might be the
identifiers from your CRM system.  The default case is marked by wrapping it
with `cdefault(...)`.  (Without this marking, the first case would be
used as the default.)

Now try to enter some values in the browser and notice two things:

- When you enter some non-numeric value into one of the integer input
  fields, you will get an error message.
- If you have entered some data, the respective input field is extended
  with a button for retracting the value.  If you click that button, the
  default value is restored and the retract button disappears.  Note
  that the retract button does not disappear when you just change the
  input back to its initial value.  openCPQ keeps track which values
  were provided explicitly and which ones were just default values.

The toolbar provides buttons for undoing and redoing your edits and for
resetting the entire configuration.

<!-- TODO
Explain the other toolbar buttons (leave some out).
-->

With the export button you can download a JSON representation of your
current configuration and with the "Choose File" and import buttons you
can upload such a JSON file again.

In the JSON data you see

- that it uses the internal names to identify group members and
  selection cases and
- that it only contains entries for those group members that have been
  set explicitly.

Furthermore notice that the material (if you have selected one
explicitly) is not given as just the internal identifier, but rather as
an object `{"$case": ...}`.  The reason for this will become clear in
the next section.


### A Bit More Complexity

While the given materials are the common ones, you want to offer the
possibility to enter other materials as well.  For this you extend the
material selection with a case "other", and a text field for entering
the material name:

```
ccase("other", "Other Material", CString())
```

Don't forget to declare the variable `CString` in the destructuring
assignment near the beginning of the file.

If your gulp process is still running (and does not report an error),
your browser API should refresh automatically.  Now you can select the
"Other Material" in the 


<!-- TODO
- validation
- conditional group members, disallowed selection cases
- configuration result (BOM)
- multiple products
  - material on top-level is inherited but overridable
-->
