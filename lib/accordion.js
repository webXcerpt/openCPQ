var React = require("react");
var {Type} = require("./base");
var {LabeledNode} = require("./label");
var {GroupNode, preprocessMembers} = require("./group");
var {Accordion, Panel} = require("react-bootstrap");

function CAccordion(rawMemberDecls) {
	return new Type("accordion", function makeAccordion(ctx) {
		return new AccordionNode(preprocessMembers(rawMemberDecls, ctx));
	});
}

class AccordionNode extends GroupNode {
	render() {
		return <Accordion defaultActiveKey={2}>
			{this.mapMembers(({node}, i) => {
				if (node != undefined) {
					var label = "???";
					if (node instanceof LabeledNode) {
						label = node.label;
						node = node.inner;
					}
					return <Panel eventKey={i} header={label}>{node.render()}</Panel>;
				}
			})}
		</Accordion>;
	}
}

module.exports = {CAccordion, AccordionNode};
