# openCPQ
A browser-based product-configuration framework

Follow [this link](http://webxcerpt.github.io/openCPQ/) for documentation.


## A Note on Installation

npm dependencies can be tricky.  And peer dependencies are particularly
tricky.

All the packages openCPQ depends on might also be used directly by your
openCPQ application.  (For `react` it is actually important that only a
single copy is being used.)  Thus we declared them as peer dependencies
and actually expect them to be satisfied in some node_modules directory
further up the directory hierarchy.  If I understand correctly, npm
version 3.x will not install peer dependencies locally, but will only
check them, which is exactly what we want.  But for now npm 2.x does
install peer dependencies if they are not yet satisfied.

If you are working on the openCPQ framework and openCPQ applications in
parallel then you typically don't want to install a snapshot of the
opencpq module.  Instead, you want to access a working copy of openCPQ's
git repository (i.e. this directory) from the application.  One way to
achieve this is something like the following directory structure:

```
  +- some_common_ancestor_directory
     +- node_modules
	 |  +- opencpq (this directory)
	 |  +- (openCPQ's peer dependencies)
	 +- path
		+- to
		   +- some_application
		   +- another_application
```

So in `some_common_ancestor_directory` you run

```
  npm install babel-core browser-filesaver react react-bootstrap
```

or you just run

```
  npm install
```

after creating a small `package.json` with the dependencies and possibly
version ranges.

In the current directory
(`some_common_ancestor_directory/node_modules/opencpq`) you don't run
`npm install`.

And in your applications you don't install `opencpq` and its
dependencies.  (Remove them from package.json before running `npm
install`.)
