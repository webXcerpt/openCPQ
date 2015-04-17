var React = require("react");
var {Button} = require("react-bootstrap");


var confirmMark = "\u2713"; // check mark
var retractMark = "\u00D7"; // multiplication sign

function confirmOrRetractButton(userSelected, confirm, retract) {
	return userSelected
		? <Button onClick={retract}>{retractMark}</Button>
		: <Button onClick={confirm}>{confirmMark}</Button>;
}

module.exports = {confirmOrRetractButton}
