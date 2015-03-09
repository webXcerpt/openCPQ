var {Type, Node} = require("./base");

class View {
	constructor(name, render) {
		this.name = name;
		this.render = render;
	}
}

function CWorkbench(viewsFn, render, type) {
	return new Type("workbench", function makeWorkbench(value, updateTo, ctx) {
		var views = viewsFn(ctx);
		var node = type.makeNode(value, updateTo, ctx);
		return new WorkbenchNode({views, render, node});
	});
}

class WorkbenchNode extends Node {
	renderHB() {
		var {views, render, node} = this.__options;
		return {body: render(node, views)};
	}
}

module.exports = {View, CWorkbench};
