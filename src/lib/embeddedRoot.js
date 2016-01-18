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
				this.setState({config});
		});
		return {config: embeddingAPI.config};
	},
	render() {
		const {type, embeddingAPI, initialCtxProvider} = this.props;
		const ctx = {
			...initialCtxProvider(),
			value: this.state.config,
			updateTo: newValue => {
				embeddingAPI.outwardValue && embeddingAPI.outwardValue(newValue);
			},
		};
		var node = type.makeNode(ctx);
		// "outward" is deprecated, provide "outwardCtx" in the embedding API
		// instead.
		delay(() => embeddingAPI.outward && embeddingAPI.outward(ctx));
		delay(() => embeddingAPI.outwardCtx && embeddingAPI.outwardCtx(ctx));
		return node.render();
	},
});

function findEmbeddingAPI() {
	const {frameElement} = window;
	return frameElement && frameElement.openCPQEmbeddingAPI;
}

function embed(type, embeddingAPI, initialCtxProvider, htmlElement) {
	React.render(
		<EmbeddedRoot {...{type, embeddingAPI, initialCtxProvider}}/>,
		htmlElement
	);
}

module.exports = {EmbeddedRoot, findEmbeddingAPI, embed};
