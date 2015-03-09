var React = require("react");

var {Type, Node} = require("./base");

function CHtml(x) {
	return new Type("html", function makeHtmlNode(value, updateTo, ctx) {
		return new HtmlNode(x instanceof Function ? x(ctx) : x)
	});
}

class HtmlNode extends Node {
	constructor(html) {
		this._html = html;
	}
	renderHB() {
		return {head: this._html};
	}
}

module.exports = {
    CHtml
}
