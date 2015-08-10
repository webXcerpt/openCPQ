var React = require("react");
var {Type} = require("./base");
var {LabeledNode} = require("./label");
var {GroupNode, preprocessMembers} = require("./group");
var {Accordion, Panel} = require("react-bootstrap");

function CAccordion(rawMemberDecls) {
	return new Type("accordion", function makeAccordion(ctx) {
		var {value = {}, updateTo} = ctx;
		return new AccordionNode(
			value.selectedView || 0,
			key => updateTo({...value, selectedView: key}),
			preprocessMembers(rawMemberDecls, ctx)
		);
	});
}

class AccordionNode extends GroupNode {
	constructor(selected, select, members) {
		super(members);
		this._selected = selected;
		this._select = select;
	}
	render() {
		return <Accordion activeKey={this._selected} onSelect={this._select}>
			{this.mapMembers(({node}, i) => {
				if (node != undefined) {
					var label = "???";
					if (node instanceof LabeledNode) {
						label = node.label;
						node = node.inner;
					}
					return <Panel eventKey={i} header={label}>{
						i == this._selected && node.render()
					}</Panel>;
				}
			})}
		</Accordion>;
	}
}

module.exports = {CAccordion, AccordionNode};
