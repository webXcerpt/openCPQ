var React = require("react");
var {Type} = require("./base");
var {LabeledNode} = require("./label");
var {GroupNode, preprocessMembers} = require("./group");
var {TabbedArea, TabPane} = require("react-bootstrap");

function CTabbedArea(rawMemberDecls) {
	return new Type("tabs", function makeTabbedArea(ctx) {
		return new TabbedAreaNode(preprocessMembers(rawMemberDecls, ctx));
	});
}

class TabbedAreaNode extends GroupNode {
	render() {
		return <TabbedArea defaultActiveKey={2}>
			{this.mapMembers(({node}, i) => {
				if (node != undefined) {
					var label = "???";
					if (node instanceof LabeledNode) {
						label = node.label;
						node = node.inner;
					}
					return <TabPane eventKey={i} tab={label}>{node.render()}</TabPane>;
				}
			})}
		</TabbedArea>;
	}
}

module.exports = {CTabbedArea, TabbedAreaNode};
