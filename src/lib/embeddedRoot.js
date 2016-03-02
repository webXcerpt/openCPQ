import React from "react";
import {serialize, deserialize} from "./serialize";

function deserialize_top(config) {
	return config === undefined ? undefined : deserialize(config);
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

const EmbeddedRoot = React.createClass({
	componentWillMount() {
		// TODO can't this be simplified?
		this.props.emitStateAccess(() => this.state, state => this.setState(state));
	},
	getInitialState() {
		return {config: this.props.config};
	},
	render() {
		const {type, send, initialCtxProvider, makeResult} = this.props;
		const ctx = {
			...initialCtxProvider(),
			value: this.state.config,
			updateTo: newValue => send("value", serialize(newValue))
		};
		const node = type.makeNode(ctx);
		send("results", makeResult(node, ctx));
		return node.render();
	},
});

function embed(type, initialCtxProvider, makeResult, mountPoint) {
	const embedder = window.parent;
	let tag = undefined;
	let embedderOrigin = "*";

	function send(action, args) {
		const message = {url: document.URL, tag, action, args};
		embedder.postMessage(message, embedderOrigin);
	}

	let setState;
	let getState;

	window.addEventListener("message", ({source, data}) => {
		const {url, tag: new_tag, action, args} = data;
		try {
			if (source !== embedder)
				throw "Received message from unknown window.";
			if (url !== document.URL)
				throw `Unexpected URL in received message: ${url}.`;
			if (action === "init") {
				if (tag !== undefined)
					throw `Attempt to re-initialize configurator.`;
				tag = new_tag;
				embedderOrigin = args.embedderOrigin;
			}
			else {
				if (tag === undefined)
					throw `First message should initialize the configurator.`;
			}
			if (new_tag !== tag)
				throw `Unexpected tag in message: ${new_tag}; expected: ${tag}.`;
		} catch(e) {
			alert(
				`Ignoring unexpected message received by configurator ` +
				`${document.URL}:\n${e}`
			);
			return;
		}

		switch (action) {
			case "init":
				React.render(
					<EmbeddedRoot {...{
							type,
							config: deserialize_top(args.config),
							send,
							initialCtxProvider,
							makeResult,
							emitStateAccess: (getter, setter) => {
								getState = getter;
								setState = setter;
							},
					}}/>,
					mountPoint
				);
				break;
			case "value":
				if (!deepEqual(args, getState().config))
					setState({config: deserialize_top(args)});
				break;
			default:
				alert(`Unexpected action in message: ${action}`)
		}
	});

	send("ready");
}

module.exports = {embed};
