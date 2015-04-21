var {CString, CValidate} = require("opencpq");

/*
 * Phone numbers
 */
var phonePattern = /^\s*\(\d\d\d\)\s*\d\d\d-\d\d\d\d\s*$/;
function CPhone() {
	return CValidate(
		(n, cb, ctx) => {
			if (!phonePattern.test(n.value))
				cb.error("Enter a phone number in the format \"(999) 999-9999\"");
		},
		CString()
	);
}

module.exports = {CPhone};