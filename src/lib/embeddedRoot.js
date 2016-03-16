import React from "react";
import {serialize, deserialize} from "./serialize";
import {ButtonToolbar, ButtonGroup, Button, DropdownButton, MenuItem, Glyphicon} from 'react-bootstrap';

function deserialize_top(config) {
	return config === undefined ? undefined : deserialize(config);
}

class EmbeddedRoot extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			config: this.props.config,
			configValid: this.props.configValid,
			past: null,
			future: null,
		};
	}
	render() {
		const {type, initialCtxProvider} = this.props;
		const {config, configValid, past, future} = this.state;
		if (!configValid) {
			const startOver = () => this.setState({
				config: undefined,
				configValid: true,
			})
			return <div style={{margin: "10px"}}>
				<h1 style={{color: "red"}}>Invalid Configuration</h1>
				<p>
					This configurator has received invalid configuration data.
				</p>
				<p>
					You can
					{} <button onClick={() => this.do_close()}>close</button> {}
					this configurator and solve the problem outside.
				</p>
				<p>
					Or you can start over with an
					{} <button onClick={startOver}>empty configuration</button>.
				</p>
				<p>Received configuration:</p>
				<pre>{config}</pre>
			</div>;
		}
		const ctx = {
			...initialCtxProvider(),
			value: config,
			updateTo: newValue => this.setConfig(newValue),
		};
		const node = type.makeNode(ctx);
		return (
			<div style={{
				height: "100%",
				display: "flex",
				flexDirection: "column"
			}}>
				<div style={{
					minHeight: "10px",
					borderWidthTop: "0px",
					borderBottom: "1px solid #CCC",
					borderWidthLeft: "0px",
					borderWidthRight: "0px",
					flex: "1 1 auto",
					display: "inline-flex",
				}}>
					{node.render()}
				</div>
				<footer style={{
					flex: "0 0 auto",
					margin: "0px 5px",
				}}>
					<ButtonToolbar>
						<ButtonGroup>
							<Button className="navbar-btn" onClick={() => this.do_ok(node, ctx)} bsStyle="primary">OK</Button>
							{
								// Poor man's confirmation dialog if there have been changes
								past
								?	<DropdownButton className="navbar-btn" dropup title="Close">
										<MenuItem onSelect={() => this.do_ok(node, ctx)}>Pass back configuration</MenuItem>
										<MenuItem onSelect={() => this.do_close()}>Discard configuration</MenuItem>
									</DropdownButton>
								: <Button className="navbar-btn" onClick={() => this.do_close()}>Close</Button>
							}
						</ButtonGroup>
						<Button className="navbar-btn" disabled={config == null} onClick={() => this.do_clear()}><Glyphicon glyph="remove"/> Clear</Button>
						<ButtonGroup>
							<Button className="navbar-btn" disabled={!past} onClick={() => this.do_undo_all()}><Glyphicon glyph="fast-backward"/> Undo All</Button>
							<Button className="navbar-btn" disabled={!past} onClick={() => this.do_undo()}><Glyphicon glyph="step-backward"/> Undo</Button>
							<Button className="navbar-btn" disabled={!future} onClick={() => this.do_redo()}><Glyphicon glyph="step-forward" /> Redo</Button>
							<Button className="navbar-btn" disabled={!future} onClick={() => this.do_redo_all()}><Glyphicon glyph="fast-forward" /> Redo All</Button>
						</ButtonGroup>
					</ButtonToolbar>
				</footer>
			</div>
		);
	}
	setConfig(newConfig) {
		const {config, past} = this.state;
		this.setState({
			config: newConfig,
			past: {car: config, cdr: past},
			future: null,
		})
	}
	do_ok(node, ctx) {
		const {sendToEmbedder, makeResult} = this.props;
		sendToEmbedder("close", {
			value: serialize(this.state.config),
			...makeResult(node, ctx),
		});
	}
	do_close() {
		const {sendToEmbedder} = this.props;
		sendToEmbedder("close");
	}
	do_clear() {
		this.setConfig(undefined);
	}
	do_undo_all() {
		var {config, past, future} = this.state;
		while (past) {
			future = {car: config, cdr: future},
			config = past.car;
			past = past.cdr;
		}
		this.setState({config, past, future})
	}
	do_undo() {
		const {config, past, future} = this.state;
		if (past)
			this.setState({
				config: past.car,
				past: past.cdr,
				future: {car: config, cdr: future},
			});
	}
	do_redo() {
		const {config, past, future} = this.state;
		if (future)
			this.setState({
				config: future.car,
				past: {car: config, cdr: past},
				future: future.cdr,
			});
	}
	do_redo_all() {
		var {config, past, future} = this.state;
		while (future) {
			past = {car: config, cdr: past};
			config = future.car;
			future = future.cdr;
		}
		this.setState({config, past, future})
	}
}

function embed(type, initialCtxProvider, makeResult, mountPoint) {
	// Using initialURL avoids problems with changing fragment identifiers in document.URL.
	const initialURL = document.URL.replace(/#.*/, '');
	const embedder = window.parent;
	let tag = undefined;
	let embedderOrigin = "*";

	function sendToEmbedder(action, args) {
		const message = {url: initialURL, tag, action, args};
		embedder.postMessage(message, embedderOrigin);
	}

	window.addEventListener("message", ({source, data}) => {
		const {url, tag: new_tag, action, args} = data;
		try {
			if (source !== embedder)
				throw "Received message from unknown window.";
			if (url !== initialURL)
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
				`${initialURL}:\n${e}`
			);
			return;
		}

		switch (action) {
			case "init": {
				let config, configValid;
				try {
					config = deserialize_top(args.config);
					configValid = true;
				}
				catch (e) {
					config = args.config.toString();
					configValid = false;
				}
				React.render(
					<EmbeddedRoot {...{
							// TODO Remove some of these attributes?
							type,
							config,
							configValid,
							sendToEmbedder,
							initialCtxProvider,
							makeResult,
						}}/>,
						mountPoint
					);
				break;
			}
			default:
				alert(`Unexpected action in message: ${action}`)
		}
	});

	sendToEmbedder("ready");
}

module.exports = {embed};
