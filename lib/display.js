var React = require("react");

var HBox = React.createClass({
	render() {
		return <div style={{display:"inline-flex"}}>{this.props.children}</div>;
	}
});

module.exports = {HBox};
