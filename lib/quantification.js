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
	makeRow(element, updateElement, ctx) {
		var {quantity} = element;
		if (quantity == undefined) {
			quantity = "1";
			element = {...element, quantity};
		}
		var q = parseInt(quantity);
		// TODO Get relevant ctx members dynamically.  (Use CMultiplying.)
		var {bom} = ctx;
		var subBOM = bom.multiplying(q);
		var node = super.makeRow(element, updateElement, {...ctx, quantity: q, bom: subBOM});
		ctx.totalQuantity.add(q);
		bom.closeMultiplying(subBOM, q);
		return node;
	}
	makeNode(value, updateTo, ctx) {
		var totalQuantity = new Counter();
		var node = super.makeNode(value, updateTo, {...ctx, totalQuantity});
		node.totalQuantity = totalQuantity.get();
		return node;
	}
}

class Counter {
	constructor() {
		this._val = 0;
	}
	add(n) {
		this._val += n;
	}
	get() {
		return this._val;
	}
}

module.exports = {CQuantifiedList};
