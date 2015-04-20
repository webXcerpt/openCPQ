var React = require("react");
var {Type} = require("./base");
var {LabeledNode} = require("./label");
var {GroupNode, preprocessMembers} = require("./group");
var {TabbedArea, TabPane} = require("react-bootstrap");

function CTabbedArea(rawMemberDecls) {
	return new Type("tabbed-area", function makeTabbedArea(ctx) {
		var {value = {}, updateTo} = ctx;
		return new TabbedAreaNode(
			value.selectedView || 0,
			key => updateTo({...value, selectedView: key}),
			preprocessMembers(rawMemberDecls, ctx)
		);
	});
}

class TabbedAreaNode extends GroupNode {
	constructor(selected, select, members) {
		super(members);
		this._selected = selected;
		this._select = select;
	}
	render() {
		return <TabbedArea activeKey={this._selected} onSelect={this._select}>
			{this.mapMembers(({node}, i) => {
				if (node != undefined) {
					var label = "???";
					if (node instanceof LabeledNode) {
						label = node.label;
						node = node.inner;
					}
					return <TabPane eventKey={i} tab={label}>{
						i == this._selected && node.render()
					}</TabPane>;
				}
			})}
		</TabbedArea>;
	}
}

module.exports = {CTabbedArea, TabbedAreaNode};
