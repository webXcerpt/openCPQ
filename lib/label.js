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
		this._label = label;
		this._innerNode = innerNode;
	}
	get inner() {
		return this._innerNode;
	}
	get value() {
		return this.inner.value;
	}
	renderHB() {
		var {head, body} = this.inner.renderHB();
		head = head == undefined ? this._label : <HBox>{this._label} {head}</HBox>;
		return {head, body};
	}
}

module.exports = {CLabeled};
