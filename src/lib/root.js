var React = require("react");
var saveAs = require("browser-filesaver");
var {ButtonToolbar, ButtonGroup, Button, Input, Glyphicon, Navbar, Nav} = require('react-bootstrap');

function cons(x, list) {
	list = list.slice();
	list.unshift(x);
	return list;
}

function rest(list) {
	return list.slice(1);
}

function first(list) {
	return list[0];
}

var RootWidget = React.createClass({
	componentDidMount() {
		// Keyboard shortcuts:
		// - Control-Z: undo
		// - Shift-Control-Z: redo
		// TODO: Control-S: save the current configuration
		//
		// Undo/redo shortcuts are disabled for Chrome due to the
		// following problem:
		//   At least on Chrome/Linux Control-Z triggers
		//   Chrome's own undo, which can apparently not be
		//   intercepted by the web page if Chrome has something to
		//   undo by itself.  So we get the odd behavior that after
		//   some editing typically
		//   - the first Control-Z undoes the last edit (via Chrome
		//     itself) and pushes this change on the app's undo
		//     stack,
		//   - the second Control-Z undoes the first change on the
		//     app's undo stack, i.e., it redoes the last edit,
		//   - more Control-Zs undo the edit again.
		//   Similarly a Control-Shift-Z may perform a Chrome redo,
		//   which is a change action for the app.  This is pushed on
		//   the undo stack and the redo stack is cleared, which is
		//   probably not what the user expects.
		this.getDOMNode().onkeypress = e => {
			function stop() {
				if (e.preventDefault)
					e.preventDefault();
				if (e.stopPropagation)
					e.stopPropagation();
			}
			// TODO: Search for a standard implementation for detecting specific keys.
			if (e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey &&
				(e.key === "z" // Firefox
				 // || e.keyCode === 26 // Chrome; disabled, see comment above
				))
			{
				this._undo();
				stop();
			}
			if (e.ctrlKey && !e.altKey && !e.metaKey && e.shiftKey &&
				(e.key === "Z" // Firefox
				 // || e.keyCode === 90 // Chrome; disabled, see comment above
				))
			{
				this._redo();
				stop();
			}
		}
	},
	getInitialState() {
		return {
			now: this.props.initialJSON,
			past: [],
			future: [],
		}
	},
	_undo() {
		var {now, past, future} = this.state;
		if (past.length > 0)
			this.setState({
				now: first(past),
				past: rest(past),
				future: cons(now, future)
			});
	},
	_redo() {
		var {now, past, future} = this.state;
		if (future.length > 0)
			this.setState({
				now: first(future),
				past: cons(now, past),
				future: rest(future)
			});
	},
	_reset() {
		var {now, past, future} = this.state;
		this.setState({
			now: undefined,
			past: cons(now, past),
			future: []
		});
	},
	_save() {
		localStorage.openCPQ = JSON.stringify(this.state);
	},
	_restore() {
		this.setState(JSON.parse(localStorage.openCPQ));
	},
	_import() {
		var fileReader = new FileReader();
		var {now, past} = this.state;
		fileReader.onload = e => this.setState({
			now: JSON.parse(e.target.result),
			past: cons(now, past),
			future: []
		});
		fileReader.readAsText(document.getElementById("import").files[0], "UTF-8"); // TODO can this be improved? getElementById does not seem to be nice
	},
	_export() {
		var blob = new Blob([JSON.stringify(this.state.now, null, 2)], {type: "application/json;charset=utf-8"});
		saveAs(blob, "openCPQ.json");
	},
	render() {
		var {props: {type, initialCtxProvider}, state: {now, past, future}} = this;
		var node = type.makeNode({
			...initialCtxProvider(),
			value: now,
			updateTo: newValue => this.setState({
				now: newValue,
				past: cons(now, past),
				future: []
			})
		});
		// TODO the import button should be improved - there are solutions using CSS styling in the web
		return <div >
			<Navbar className="navbar" fluid>
	    		<Nav className="navbar-brand"/>
		    	<Nav>
		    		<ButtonToolbar>
					    <ButtonGroup>
							<Button className="navbar-btn" disabled={past  .length === 0} onClick={this._undo}><Glyphicon glyph="step-backward"/> undo</Button>
							<Button className="navbar-btn" disabled={future.length === 0} onClick={this._redo}><Glyphicon glyph="step-forward"/> redo</Button>
					    </ButtonGroup>
					    <ButtonGroup>
							<Button className="navbar-btn" disabled={past  .length === 0} onClick={this._reset}><Glyphicon glyph="fast-backward"/> reset</Button>
					    </ButtonGroup>
						{// local storage is not always available (e.g., in IE with file: URLs)
							(window.localStorage == undefined) ? undefined : [
							    <ButtonGroup>
									<Button className="navbar-btn" onClick={this._save}><Glyphicon glyph="floppy-save"/> save</Button>
									<Button className="navbar-btn" disabled={localStorage.openCPQ == undefined} onClick={this._restore}><Glyphicon glyph="floppy-open"/> restore</Button>
							    </ButtonGroup>
							]
						}
					    <ButtonGroup>
					    	<form className="navbar-form">
					    		<Input id="import" type="file" name="files"/>
					    		<Button onClick={this._import}><Glyphicon glyph="import"/> import</Button>
					    		<Button disabled={this.state.now == undefined} onClick={this._export}><Glyphicon glyph="export"/> export</Button>
							</form>
					    </ButtonGroup>
				    </ButtonToolbar>
		    	</Nav>
	    	</Navbar>
			<div>
				{node.render()}
			</div>
		</div>;
	}
});

function renderTree(type, initialJSON, initialCtxProvider, htmlElement) {
	React.render(
		<RootWidget type={type} initialJSON={initialJSON} initialCtxProvider={initialCtxProvider}/>,
		htmlElement
	);
}

module.exports = {renderTree};
