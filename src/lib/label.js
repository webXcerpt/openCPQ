var React = require("react");
var {HBox} = require("./display");
var {Type, Node} = require("./base");

function CLabeled(label, type) {
	return new Type("labeled", function makeLabeled(ctx) {
		return new LabeledNode(label, type.makeNode(ctx));
	});
}

class LabeledNode extends Node {
	constructor(label, innerNode) {
		super();
		this._label = label;
		this._innerNode = innerNode;
	}
	get label() {
		return this._label;
	}
	get inner() {
		return this._innerNode;
	}
	get value() {
		return this.inner.value;
	}
	render() {
		return <div className="labeled">
			<div className="labeled-label">{this._label}</div>
			<div className="labeled-data">{this.inner.render()}</div>
		</div>;
	}
}

module.exports = {CLabeled, LabeledNode};
