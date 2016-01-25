var {Type, Node} = require("./base");

class View {
	constructor(name, render) {
		this.name = name;
		this.render = render;
	}
}

function CWorkbench(viewsFn, render, type) {
	return new Type("workbench", function makeWorkbench(ctx) {
		return new WorkbenchNode({
			views: viewsFn(ctx),
			render,
			node: type.makeNode(ctx)
		});
	});
}

class WorkbenchNode extends Node {
	get inner() { return this.__options.node; }
	render() {
		var {views, render, node} = this.__options;
		return render(node, views);
	}
}

module.exports = {View, CWorkbench};
