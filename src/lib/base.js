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
	/**
	* For the first class FooNode in the superclass chain for which v.foo is a
	* function, call v.foo(this).  Otherwise call v.unimplemented(this);
	*/
	visit(v) {
		for(var proto = Object.getPrototypeOf(this); proto.constructor !== Node; proto = Object.getPrototypeOf(proto)) {
			const name = proto.constructor.name;
			if (name.endsWith("Node")) {
				const prefix = name.substr(0, name.length - 4);
				const key =
					prefix === prefix.toUpperCase()
					? prefix.toLowerCase()
					: prefix.substr(0, 1).toLowerCase() + prefix.substr(1);
				if (typeof v[key] === "function")
					return v[key](this);
			}
		}
		return v.unimplemented(this);
	}
}

module.exports = {
	Type, Node
};
