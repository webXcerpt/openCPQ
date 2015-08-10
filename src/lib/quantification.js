var {CInteger} = require("./primitives");
var {CMultiplying} = require("./linear-aggregation");
var {CValidate} = require("./validation");
var {CGroup, cUnlabelledMember} = require("./group");
var {ccolumn, CTable} = require("./table");
var {CSideEffect} = require("./util");
var {CNameSpace} = require("./names");

function CQuantified(type) {
	return CGroup(({value: {quantity} = {}}) => [
		cUnlabelledMember("quantity", CValidate(
			function checkQuantity(node, {error, warning, info}, ctx) {
				var value = node.inner.value;
				if (isNaN(value) || value < 1)
					error("Enter a positive whole number.")
			},
			CInteger({defaultValue: 1, className: "quantity"})
		)),
		cUnlabelledMember("value", CMultiplying(
			// TODO Don't repeat the defaulting logic of
			// IntegerNode/StringNode here.
			quantity === "" || quantity == null ? 1 : quantity,
			type))
	]);
}

function CQuantifiedList(options, label, type) {
	var {defaultValue} = options;
	if (defaultValue == undefined)
		options = {...options, defaultValue: [undefined]};
	return CTable(
		options,
		[ccolumn("quantity", "#"), ccolumn("value", label)],
		CQuantified(type)
	);
}

module.exports = {CQuantified, CQuantifiedList};
