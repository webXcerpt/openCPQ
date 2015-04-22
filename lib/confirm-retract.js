var React = require("react");
var {Button, Glyphicon} = require("react-bootstrap");


function confirmOrRetractButton(userSelected, confirm, retract, size = "medium") {
	return userSelected
		? <Button className="dim" bsSize={size} onClick={retract}><Glyphicon glyph="remove"/></Button>
		: <Button className="dim" bsSize={size} onClick={confirm}><Glyphicon glyph="ok"    /></Button>;
}

module.exports = {confirmOrRetractButton}
