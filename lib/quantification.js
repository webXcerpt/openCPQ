var {CInteger} = require("./primitives");
var {CMultiplying} = require("./linear-aggregation");
var {CValidate} = require("./validation");
var {ccolumn, TableType} = require("./table");
var {CValidate} = require("./validation");

function CQuantity() {
	return CValidate(
		function checkQuantity(node, {error, warning, info}, ctx) {
			var value = node.inner.value;
			if (isNaN(value) || value < 1)
				error("Enter a positive whole number.")
		},
		CInteger({className: "quantity"})
	);
}

function CQuantifiedList(options, label, type) {
	var {defaultValue} = options;
	if (defaultValue == undefined)
		options = {...options, defaultValue: [undefined]};
	return new QuantifiedListType(options, label, type);
}

class QuantifiedListType extends TableType {
	constructor(options, label, type) {
		super(options, [
			ccolumn("quantity", "#" , CQuantity()),
			ccolumn("value", label, type)
		]);
	}
	makeRow(ctx) {
		var {value, linearAggregators = []} = ctx;
		var {quantity} = value;
		if (quantity == undefined) {
			quantity = "1";
			value = {...value, quantity};
		}
		var q = parseInt(quantity);
		var subCtx = {...ctx, value};
		// TODO return CMultiplying(q, ......)
		for (var linAggName of linearAggregators)
			subCtx[linAggName] = ctx[linAggName].multiplying(q);
		var node = super.makeRow(subCtx);
		for (var linAggName of linearAggregators.slice().reverse())
			ctx[linAggName].closeMultiplying(subCtx[linAggName], q);
		return node;
	}
}

module.exports = {CQuantifiedList};
