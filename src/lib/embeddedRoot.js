var React = require("react");

function delay(fn) {
	setTimeout(fn, 1);
}

// for JSON-style values
function deepEqual(x, y) {
	if (x === y)
		return true;
	if (x == null || y == null)
		return false;
	const c = x.constructor;
	if (y.constructor !== c)
		return false;
	switch (c) {
	case Array: {
		const l = x.length;
		if (y.length != l)
			return false;
		for (var i = 0; i < l; i++)
			if (!deepEqual(x[i], y[i]))
				return false;
	}
	case Object: {
		for (const i in x)
			if (!(i in y && deepEqual(x[i], y[i])))
				return false;
		for (const i in y)
			if (!(i in x))
				return false;
	}
	default:
		return false;
	}
}

var EmbeddedRoot = React.createClass({
	getInitialState() {
		const {embeddingAPI} = this.props;
		embeddingAPI.inward = config => delay(() => {
			if (!deepEqual(this.state.config, config))
				this.state.config = config;
		});
		// ### remove embeddingAPI.inward upon unload?
		return {config: embeddingAPI.config};
	},
	render() {
		const {type, embeddingAPI, initialCtxProvider} = this.props;
		const ctx = {
			...initialCtxProvider(),
			value: this.state.config,
			updateTo: newValue => this.setState({config: newValue}),
		};
		var node = type.makeNode(ctx);
		delay(() => embeddingAPI.outward(ctx));
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
