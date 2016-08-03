---
title: Tutorial
prio: 1
---

Tutorial
========

Prerequisites
-------------

### Skills

*openCPQ* applications are written in JavaScript.  While you need not be a
JavaScript expert, you are expected to have some basic understanding of the
language.  (Even if you don't know JavaScript right now, it might be worthwhile
to learn.  It's useful for many things, not just for *openCPQ*.)  For
convenience, we are using modern JavaScript features from ECMAScript 2015/2016
and a few more new features supported by [*Babel*](http://babeljs.io). These
features might be new to you, but you can look them up as you go.

We also use a few popular tools and libraries from the JavaScript
ecosystem.  This tutorial aims to provide all the steps necessary to get
the examples running, but you might need to consult the respective
documentation when you're working on your own application.  (Again,
knowing about those tools is useful beyond *openCPQ*.)


### Software

*openCPQ* applications need some preprocessing before they can be executed.  We
are using tools from the [node.js](http://nodejs.org) ecosystem for this.  You
need to have the JavaScript interpreter `node` and the related package manager
`npm` installed.  (The examples of this tutorial are known to work with version
6.3.1 of node.js.)  Make sure that the `bin` directory of the downloaded and
unpacked node.js distribution is listed in your `PATH` environment variable, so
that the programs `node` and `npm` will be found by your system.


Getting started
---------------

### The Project Folder

In an empty folder run the command

```sh
npm init
```

to set up a `package.json` file, which will hold some configuration for
your app.  You can answer each of the questions asked by `npm init` by
just hitting the enter/return key.  The default answers are ok for now.


### Dependencies

Now install *openCPQ* and third-party packages:

```sh
npm install --save-dev opencpq@0.1.2 webpack@^1.8.4 webpack-dev-server@^1.8.0 babel-loader@^5.0.0 css-loader@^0.10.1 file-loader@^0.8.1 less-loader@^2.2.0 style-loader@^0.10.1 url-loader@^0.5.6 babel-core@^5.1.2 bootstrap@^3.3.5 less@^2.3.1 browser-filesaver@^1.0.0 react@^0.13.1 react-bootstrap@^0.20.1 react-widgets@^2.4.1 babel-plugin-object-assign@^1.2.1
```

(`npm` may try to compile some C++ code for the indirectly used packages
`bufferutil` and `utf-8-validate` using the `gyp` tool.  This may fail
and produce error messages.  You can ignore these messages since these
packages are optional.)

A quick overview of the installed packages:
- `opencpq` is the *openCPQ* library.
- `webpack` and `webpack-dev-server` will be used to package up your
  application.  (If you are familiar with another packaging tool such as
  browserify and prefer to use that, this should work as well.  Notice
  that we are using CommonJS-style modules and will migrate to
  ECMAScript-6 modules.  This needs to be supported by your packager.)
- The packages `...-loader` will be used by *webpack* to handle files of
  certain types.
- `babel-core` contains the JavaScript preprocessor *Babel*, which
  converts JavaScript with modern features into more traditional
  JavaScript so that it is understood by current (or even older)
  browsers.
- From `bootstrap` we are primarily using the CSS styling for the UI
  components of our application. `less` is used to convert the styling
  from the higher-level language "less" to CSS syntax.
- `react` is a UI library heavily used by openCPQ.  `react-bootstrap`
  and `react-widgets` provide UI components.
- `babel-plugin-object-assign` is not used directly but only by other
  packages.  For technical reasons it must nevertheless be installed
  explicitly here.

You may omit the version numbers (`@...`) to get the latest versions of
the packages.  But using them reduces incompatibility risks.  In
particular, this tutorial has been written for the given version of
*openCPQ*.

The option `--save-dev` makes sure that the packages are not only
installed in the subfolder `node_modules`, but that the package names
and versions are also saved as "dependencies" in the file
`package.json`.  (Actually the packages are "development dependencies",
indicating that you only need them while you are developing your
application but not when you will run it.)  If you manage your
application in a version-control system, you can exclude the (huge)
`node_modules` folder from version control.  After a fresh checkout of
the project folder from version control, you can simply run `npm
install` to install all the dependencies.


Hello World
-----------

In your project folder, create a file `index.html` with this content:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>openCPQ Tutorial</title>
</head>

<body>
  <script src="bundle.js"></script>
</body>
</html>
```

..., a file `index.js` with this content:

```jsx
import React from "react";

import {
    CWorkbench,
    CGroup, cmember,
    CSelect, ccase, cdefault, unansweredCase,
    CString,
    renderTree, rootPath,
    Problems,
} from "opencpq";

const model = CGroup([
    cmember("size", "Size", CSelect([
        ccase("XXS"),
        ccase("XS"),
        ccase("S"),
        cdefault(ccase("M")),
        ccase("L"),
        ccase("XL"),
        ccase("XXL"),
    ])),
    cmember("color", "Color", CSelect([
        unansweredCase("Select Color"),
        ccase("red"),
        ccase("green"),
        ccase("blue"),
    ])),
    cmember("text", "Text to print on your T-shirt:", CString()),
])

const workbench = CWorkbench(
    ctx => ({}),
    innerNode => (
        <div>
            <h1>Configure Your T-Shirt</h1>
            {innerNode.render()}
        </div>
    ),
    model
);

renderTree(
    workbench,
    undefined,
    () => ({
        path: rootPath,
        problems: new Problems(),
    }),
    document.getElementsByTagName("body")[0]
);
```

..., and a file `webpack.config.js` with this content:

```js
"use strict";

var webpack = require("webpack");
var path = require("path");

module.exports = {
    target: "web",
    entry: [
        "!file?name=index.html!./index.html",
        "./index.js",
    ],
    output: {
        path: path.resolve("dst"),
        filename: "bundle.js",
        pathinfo: true,
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel?stage=0" },
            { test: /\.json$/, loader: "json" },
            { test: /\.css$/, loader: "style!css" },
            { test: /\.less$/, loader: "style!css!less" },
            { test: /\.(eot|gif|svg|ttf|woff2?)(\?.*)?$/, loader: "url?limit=10000" },
            { test: /\.png$/, loader: "url-loader?mimetype=image/png&limit=10000" },
        ]
    },
    debug: true,
    devtool: "source-map",
};
```

Finally run this command:

```sh
node_modules/.bin/webpack --progress --production
```

This should create a subfolder `dst` containing a copy of your file
`index.html`.  Point your browser to that file.  If all went well, you
can see a simple T-shirt configurator.


### What's Going On?

The *webpack* configuration in `webpack.config.js` (which is actually
JavaScript code, giving you, when needed, all the power of a programming
language for setting up complex configurations) says:
- It's an application to be run in web browsers.
- The output should include your files
  - `index.html` (as a separate file, named `index.html` again) and
  - `index.js` and everything required by it recursively (packed into a
    "bundle" by default).
- The generated output should go to subfolder `dst`.  Bundled files
  should be packaged into file `bundle.js`.  Include some path
  information (that is, names and location of the original files) in the
  bundle, which may become helpful for investigating problems.
- Use certain handlers (the "loaders" which we installed earlier) for
  preprocessing and bundling certain file types.
- Include debugging support in the bundle, in particular a mapping from
  the preprocessed and bundled code back to the respective source code.
  This will be used by JavaScript debuggers in web browsers to show you
  the original source code.

The HTML file `index.html` does little more than loading the packaged
JavaScript code from `bundle.js`.

The JavaScript file `index.js` contains the actual configurator and some
boilerplate code:
- At the core of the JavaScript code is the definition of the variable
  `model`.  It contains the configurator logic.  Here the model is a
  group `CGroup([...])` with three members `cmember(...)`:
  - A menu (`CSelect([...])`) with items (`ccase(...)`) for the
    available sizes.  Size "M" is marked as the default choice.
  - A menu for the available colors.  The first case is tagged as
    "unanswered" so that users will be notified if they did not yet
    select a color.
  - An input field for text that should be printed on the T-shirt.
- `cmember` takes three arguments: An internal name of the member, a
  label for the UI, and a model for the member.
- Variable `workbench` holds the "workbench", that is, the overall page
  content.  (In this simple example it consists only of the toolbar and
  the actual configuration UI.)  For now we ignore the details, except
  for the fact that the model is passed as an argument to the workbench.
- Finally `renderTree` attaches the workbench to the `<body>` element of
  the HTML page.  Again, we ignore the technical details for now.

We are using
[arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
from ECMAScript 6.  We use them mostly because of their concise notation
and usually don't care about the subtle difference regarding the keyword
`this` between "classic" functions (introduced by the keyword
`function`) and arrow functions.  (Anyway the treatment of `this` in
arrow functions is considered to be the more natural one.)  We are also
using ECMAScript-6 syntax for
[importing modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).

In `index.js` we can actually use all the new JavaScript syntax
supported by *Babel*, including the experimental features.  The latter
are enabled by the option `stage=0` for the *Babel* loader in the
*webpack* configuration.  But notice that in `webpack.config.js` we are
restricted to the more traditional JavaScript syntax supported directly
by `node`.



### Two Tips

For a more convenient development experience, you can run

```sh
node_modules/.bin/webpack-dev-server --progress --watch
```

in your project folder.  (**Not** in the `dst` subfolder!)
- The webpack development server will directly serve the generated
  output to
  [http://localhost:8080/index.html](http://localhost:8080/index.html)
  without using the output folder.
- The development server observes your source file (but not the webpack
  configuration!) and re-builds whenever a file changes.  If you open
  [http://localhost:8080/webpack-dev-server/index.html](http://localhost:8080/webpack-dev-server/index.html),
  your configurator will be embedded in a helper application that
  reloads the configurator after each re-build.

To reduce the amount of typing and the complexity of commands to
memorize you can replace the "scripts" section of `package.json` by

```json
  "scripts": {
    "dev-server": "node_modules/.bin/webpack-dev-server --progress --watch",
    "build": "node_modules/.bin/webpack --progress --production"
  },
```

(Be careful about the JSON syntax here.  In particular use commas to
separate the properties of an object, but not after the last property of
an object.  And use quotes around property names.  JSON parsers are
pickier than JavaScript parsers.)

Now you can use `npm run dev-server` to start the development server or
`npm run build` for a one-time build into `./dst`.


### Using the Configurator

In your browser you find the two menus and the text area corresponding
to the three questions that a user has to answer.

Things to note in the configurator:
- The default value "M" has been pre-selected as the size.
- Each input widget has to its right a greyed-out button containing
  either a check mark or a cross mark.  (The button becomes fully visible
  if you move the mouse cursor over it.)
  - If the current value has been explicitly provided by the user, the
    button contains a cross mark.  Clicking the button will retract the
    user input and replace it with the default value.
  - If the user has not yet provided input or has retracted a previous
    input, the button contains a check mark.  Clicking the button tells
    the configurator that the user accepts the default.  That is, the
    current default value will be used as the explicit user choice.

And a few notes about the tool bar:
- You can use the "undo" and "redo" buttons for undoing and redoing your
  editing actions.
- The "reset" button retracts all user inputs and sets the configuration
  back to the initial default state.  Even a "reset" action can be
  undone and redone.
- The buttons "save", "restore", "import", and "export" are essentially
  placeholders for an integration of your configurator in a backend
  system.  In your current configurator
  - "save" will store your current configuration state in browser-local
    storage and "restore" will retrieve the stored state from there.
    Notice that the stored state survives closing and opening the
    configurator page.  This dummy implementation can only hold a single
    configuration state.  A backend integration would of course support
    managing multiple states.
  - "export" allows you to download the current configuration state as a
    JSON file.  With "import" you can set the configuration to a state
    exported previously to some file.  (The file-selection widget is
    used by imports only.  In case of an "export" the user will be asked
    for a download destination as usual.)


Refining the Configurator
-------------------------

### Conditional Group Members

We want to allow users to select whether the text printed on the T-shirt
should be black or white.  This is easy to achieve by adding a new group
member:

```js
    cmember("textColor", "Text Color", CSelect([
        unansweredCase("Select Text Color"),
        ccase("black"),
        ccase("white")
    ])),
```

Notice that without an explicit default case the first one (black)
becomes the default automatically.

However, we don't want to bother users with this choice if they have not
selected any text to print.  We can achieve this by making the
"textColor" member conditional.  Instead of the `cmember(...)`
expression above, we add the following element to the `CGroup([...])`:

```js
    ({value = {}}) =>
        value.text && value.text.trim().length > 0
        ? cmember("textColor", "Text Color", CSelect([
            unansweredCase("Select Text Color"),
            ccase("black"),
            ccase("white")
        ]))
    : null,
```

There are a few things to explain here:
- An element of the array passed to `CGroup` may be a function.  (We are
  using an arrow function here.  See above for some notes on arrow
  functions.)  In this case the function will be invoked with the
  group's "context" to determine the actual group member.
- The context is an object with several properties.  Here we use the
  property `value`, which contains the group's current configuration
  state as a JSON object.  For conciseness we use ECMAScript-6
  [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
  for the function parameter: The formal parameter `{value = {}}` sets
  the local variable `value` to the `value` property of the context
  passed as an argument.  If the context's `value` property is undefined
  (which happens particularly at the beginning of the configuration
  process), the local `value` will be set to an empty object `{}`.
- In JavaScript and other languages a
  "[conditional expression](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)"
  `x ? y : z` is evaluated like this: If `x` evaluates to `true` (or
  some value considered `true` when used as a boolean), then `y` is
  evaluated to give the value of the conditional expression.  Otherwise
  `z` is used.
- We test the value's `text` property holding the text to print.  If
  that property exists and does not only consist of whitespace, then we
  return the `cmember(...)` element from before.  Otherwise we return
  `null`.
- An element of the array passed to `CGroup` may also be `null` or
  `undefined`.  In this case it is simply ignored by the group.

Now we also want to offer multiple sizes for the printed text.  Again,
this makes sense only if we have some text to print.  We could simply
add another element

```js
    ({value = {}}) =>
        value.text && value.text.trim().length > 0
        ? cmember("textSize", "Text Size:", CSelect([
            ccase(5, "5 cm"),
            ccase(6, "6 cm"),
            ccase(7, "7 cm"),
        ]))
        : null,
```

to the array given to `CGroup([...]`.  But we want to write the
condition only once for better code maintainability.  We can do this by
combining the two elements for text color and size into a single one:

```js
    ({value = {}}) =>
        value.text && value.text.trim().length > 0
        ? [
            cmember("textColor", "Text Color:", CSelect([
                unansweredCase("Select Text Color"),
                ccase("black"),
                ccase("white")
            ])),
            cmember("textSize", "Text Size:", CSelect([
                ccase(5, "5 cm"),
                ccase(6, "6 cm"),
                ccase(7, "7 cm"),
            ]))
        ]
        : null,
```

Notes:
- The function returns an array if some non-whitespace text is given.
- If a member of a `CGroup` evaluates to a list, all the members of this
  list are taken into account.

Overall the argument passed to `CGroup` is processed recursively as
follows:
- If it is an array, process each element in turn.
- If it is a function, invoke that function passing the group's context
  (with a `value` property holding the configuration state for the
  group) as the parameter.  Process the return value of the function
  invocation again.
- If it is `null` or `undefined`, ignore it.
- Otherwise add the argument (typically a `cmember(...)` expression) to
  the list of items displayed by the group.

The state of a group is represented as a simple JavaScript/JSON object
with properties corresponding to the internal member names from the
`cmember(...)` expressions.  A property may be missing or undefined if
it is unconfigured.  Similarly the entire group state may be undefined
if is completely unconfigured.  (That's why we provided the default `{}`
for the `value` in the context argument and why we checked for the
existence of `value.text` before using the string value.

The state of a `CString` is undefined or a string.

### Constraints, Validation

*[To be written]*


<!--
### A First Constraint

We also want to sell black and white T-shirts.  Adding two more cases to
the selection of T-shirt colors is trivial.  But we want to make sure
that we don't print black on black or white on white.

We add the following auxiliary function `onlyIf1` to `index.js`:

```js
function onlyIf1(condition, explanation, case_) {
    return condition ? case_ : {...case_, mode: "error", messages: [{level: "error", msg: explanation}]};
}
```

Before we look at the function implementation we have a look at how it
is used.


... black/white shirts; avoid shirtColor === textColor
-->
