class Path {
	ext(name) {
		return new SubPath(this, name);
	}
}

class RootPath extends Path {
	toString() {
		return "";
	}
}

var rootPath = new RootPath();

class SubPath extends Path {
	constructor(parent, name) {
		super();
		this._parent = parent;
		this._name = name;
		this._asString = `${parent.toString()}/${name}`;
	}
	toString() {
		return this._asString;
	}
}

module.exports = {rootPath};
