var React = require("react");

var EmbeddedRoot = React.createClass({
	render() {
		const {type, embeddingAPI, initialCtxProvider} = this.props;
		var node = type.makeNode({
			...initialCtxProvider(),
			value: embeddingAPI.state,
			updateTo: newValue => embeddingAPI.state = newValue,
		});
		embeddingAPI.stateChanged = () => this.forceUpdate();
		return node.render();
	},
});

function parseQueryPair(pair) {
	const i = pair.indexOf("=");
	if (i < 0)
		throw "'=' missing in query pair";
	return {
		name: decodeURIComponent(pair.substring(0, i)),
		value: decodeURIComponent(pair.substring(i + 1))
	};
}

function parseQuery(query) {
	return query.split("&").map(parseQueryPair);
}

function findEmbeddingAPI() {
	try {
		const search = window.location.search;
		if (!search.startsWith("?"))
			throw "missing or unexpected query";
		const tag = parseQuery(search.substring(1)).find(p => p.name === "tag").value;
		return window.parent.getOpenCPQEmbeddingAPI(tag);
	} catch(e) {
		return null;
	}
}

function embed(type, embeddingAPI, initialCtxProvider, htmlElement) {
	React.render(
		<EmbeddedRoot {...{type, embeddingAPI, initialCtxProvider}}/>,
		htmlElement
	);
}

module.exports = {EmbeddedRoot, findEmbeddingAPI, embed};
