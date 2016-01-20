var React = require("react");

var {Type, Node} = require("./base");

function CHtml(x) {
	return new Type("html", function makeHtmlNode(ctx) {
		return new HtmlNode(x instanceof Function ? x(ctx) : x)
	});
}

class HtmlNode extends Node {
	constructor(html) {
		super();
		this._html = html;
	}
	render() {
		return this._html;
	}
	renderResult() {
		// appropriate if the HTML text is a hint for the configurator,
		// but not if the HTML text should go into the output as well.
		return undefined;
	}
}

module.exports = {
    CHtml
}
