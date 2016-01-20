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
		this.__options = options || {};
	}
	render() {
		return <div className="unimplemented">### rendering not implemented for {this.constructor.name} ###</div>;
	}
	renderResult() {
		return <div className="openCPQ-result-unimplemented">### result rendering not implemented for {this.constructor.name} ###</div>;
	}
}

module.exports = {
	Type, Node
};
