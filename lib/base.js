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
