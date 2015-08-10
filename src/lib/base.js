var React = require("react");

class Type {
	constructor(name, factory) {
		this.name = name;
		this._factory = factory;
	}
	makeNode(ctx) {
		return this._factory(ctx);
	}
}

class Node {
	constructor(options) {
		this.__options = options;
	}
	render() {
		return <div>### rendering not implemented ###</div>;
	}
}

module.exports = {
	Type, Node
};
