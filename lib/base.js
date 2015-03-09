var React = require("react");

class Type {
	constructor(name, factory) {
		this.name = name;
		this._factory = factory;
	}
	makeNode(value, updateTo, ctx) {
		return this._factory(value, updateTo, ctx);
	}
}

class Node {
	constructor(options) {
		this.__options = options;
	}
	renderHB() {
		var body = <div>### rendering not implemented ###</div>;
		return {body};
	}
}

function packed({head, body}) {
	return <div>{head}{body}</div>;
}

module.exports = {
	Type, Node, packed
};
