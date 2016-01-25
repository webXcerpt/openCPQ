var React = require("react");
var {Type, Node} = require("./base");
var {LabeledNode} = require("./label");
var {Panel} = require("react-bootstrap");

// Pure GUI decoration, no business logic.
// Usage: CPanel({collapsable:true, header: "Some Header"}, innerType)
function CPanel(options, type) {
	return new Type("panel", function makePanel(ctx) {
		return new PanelNode(options, type.makeNode(ctx));
	});
}

class PanelNode extends Node {
	constructor(options, inner) {
		super(options);
		this._inner = inner;
	}
	render() {
		return <Panel {...this.__options}>{this._inner.render()}</Panel>;
	}
	get inner() { return this._inner; }
}

module.exports = {CPanel, PanelNode};
