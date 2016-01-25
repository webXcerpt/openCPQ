var React = require("react");
var {Type, Node} = require("./base");
var {View} = require("./workbench");


function VTOC({toc}) {
	return new View("toc", function renderTOC() {
		return toc.render();
	});
}

class TOC {
	constructor() {
		this._children = [];
	}
	add(fragment, heading, child) {
		this._children.push({fragment, heading, child});
	}
	get children() {
		return this._children;
	}
	render() {
		var children = this._children;
		return children.length === 0 ? undefined : <ul>{children.map(
			({fragment, heading, child}) => <li>
				<div>
					<a href={"#"+fragment}>{heading}</a>
					{child.render()}
				</div>
			</li>
		)}</ul>;
	}
}

function CTOCEntry(name, headingFn, type) {
	return new Type("tocEntry", function makeTOCEntry(ctx) {
		var fragment = ctx.path.ext(name).toString();
		var subTOC = new TOC();
		var node = type.makeNode({...ctx, toc: subTOC});
		ctx.toc.add(fragment, headingFn(node, ctx), subTOC);
		return new TOCNode({fragment, node});
	});
}

class TOCNode extends Node {
	get inner() { return this.__options.node; }
	render() {
		var {fragment, node} = this.__options
		return <span><a id={fragment}></a>{node.render()}</span>;
	}
}

module.exports = {VTOC, TOC, CTOCEntry};
