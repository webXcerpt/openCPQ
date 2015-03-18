var {CInteger} = require("./primitives");
var {CMultiplying} = require("./linear-aggregation");
var {CValidate} = require("./validation");
var {CGroup, cUnlabelledMember} = require("./group");
var {ccolumn, CTable} = require("./table");
var {CValidate} = require("./validation");
var {CSideEffect} = require("./util");
var {CNameSpace} = require("./names");

function CQuantifiedList(options, label, type) {
	var {defaultValue} = options;
	if (defaultValue == undefined)
		options = {...options, defaultValue: [undefined]};
	return CTable(
		options,
		[
			ccolumn("quantity", "#"),
			ccolumn("value", label),
		],
		CNameSpace("quantification", CGroup([
			cUnlabelledMember("quantity", CValidate(
				function checkQuantity(node, {error, warning, info}, ctx) {
					var value = node.inner.value;
					if (isNaN(value) || value < 1)
						error("Enter a positive whole number.")
				},
				CSideEffect(
					(node, {quantification}) => { quantification.qty = node.value; },
					CInteger({defaultValue: 1, className: "quantity"})
				)
			)),
			({quantification}) => cUnlabelledMember("value", CMultiplying(quantification.qty, type))
		]))
	);
}

module.exports = {CQuantifiedList};
