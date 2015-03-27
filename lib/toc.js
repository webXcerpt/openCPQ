var React = require("react");
var {Type, Node, packed} = require("./base");
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
		return children.length === 0 ? undefined : <ul>{[
			for ({fragment, heading, child} of children) <li>
				<div>
					<a href={"#"+fragment}>{heading}</a>
					{child.render()}
				</div>
			</li>
		]}</ul>;
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
	renderHB() {
		var {fragment, node} = this.__options
		var rendered = {...node.renderHB()};
		var {head, body} = rendered;
		if (head != undefined)
			head = <span><a id={fragment}></a>{head}</span>;
		else
			body = <div><a id={fragment}></a>{body}</div>;
		return {head, body};
	}
}

module.exports = {VTOC, TOC, CTOCEntry};
