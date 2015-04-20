var React = require("react");
var {Button} = require("react-bootstrap");


var confirmMark = "\u2713"; // check mark
var retractMark = "\u00D7"; // multiplication sign

function confirmOrRetractButton(userSelected, confirm, retract, size = "medium") {
	return userSelected
		? <Button className="dim" bsSize={size} onClick={retract}>{retractMark}</Button>
		: <Button className="dim" bsSize={size} onClick={confirm}>{confirmMark}</Button>;
}

module.exports = {confirmOrRetractButton}
