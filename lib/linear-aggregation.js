var {Type} = require("./base");

class SimpleAdderBase {
	multiplying(factor) {
		return new SimpleMultiplyingAdder(this, factor);
	}
	closeMultiplying(child, factor) {
		// do nothing
	}

	subAggregator() {
		return new SimpleAdder();
	}
	closeSubAggregator(subAggregator) {
		this.add(subAggregator.get());
	}
}

class SimpleAdder extends SimpleAdderBase {
	constructor() {
		super();
		this._v = 0;
	}
	get() {
		return this._v;
	}
	set(n) {
		this._v = n;
	}
	add(n = 1) {
		this._v += n;
	}
}

class SimpleMultiplyingAdder extends SimpleAdderBase {
	constructor(parent, factor) {
		super();
		this._parent = parent;
		this._factor = factor;
	}
	add(n = 1) {
		this._parent.add(this._factor * n);
	}

	// or use the inherited method:
	multiplying(factor) {
		return new SimpleMultiplyingAdder(this._parent, this._factor * factor);
	}
}


class NamedAdderBase {
	multiplying(factor) {
		return new NamedMultiplyingAdder(this, factor);
	}
	closeMultiplying(child, factor) {
		// do nothing
	}

	subAggregator() {
		return new NamedAdder();
	}
	closeSubAggregator(subAggregator) {
		subAggregator.mapItems((name, n) => this.add(name, n));
	}
}

class NamedAdder extends NamedAdderBase {
	constructor() {
		super();
		this._data = {}
	}
	empty() {
		return Object.keys(this._data).length == 0;
	}
	mapItems(fn, options = {}) {
		var {sorted} = options;
		var data = this._data;
		var keys = Object.keys(data);
		if (sorted)
			keys.sort();
		return keys.map(k => fn(k, data[k]));
	}
	get(name) {
		var n = this._data[name];
		if (n == undefined)
			n = 0;
		return n;
	}
	set(name, n) {
		if (n == 0)
			delete this._data[name];
		else
			this._data[name] = n;
	}
	add(name, n = 1) {
		this.set(name, this.get(name) + n);
	}
}

class NamedMultiplyingAdder extends NamedAdderBase {
	constructor(parent, factor) {
		super();
		this._parent = parent;
		this._factor = factor;
	}
	add(name, n = 1) {
		this._parent.add(name, this._factor * n);
	}
	multiplying(factor) {
		return new NamedMultiplyingAdder(this._parent, this._factor * factor);
	}
}


// The context contains an optional property "linearAggregators", which
// is a list of strings.  (A missing property "linearAggregators" is
// treated like an empty list.)

function CLinearAggregation(name, class_, type) {
	return new Type("linearAggregation", function makeLinearAggregation(ctx) {
		var {linearAggregators} = ctx;
		var subAggregators = linearAggregators == null ? [] : linearAggregators.slice(0);
		if (subAggregators.indexOf(name) == -1)
			subAggregators.push(name);
		return type.makeNode(
			{...ctx, linearAggregators: subAggregators, [name]: new class_()}
		);
	});
}

function CMultiplying(factor, type) {
	return new Type("multiplying", function makeMultiplying(ctx) {
		var subCtx = {...ctx};
		var {linearAggregators = []} = ctx;
		linearAggregators.forEach(k => subCtx[k] = ctx[k].multiplying(factor));
		var node = type.makeNode(subCtx);
		linearAggregators.slice(0).reverse().forEach(k => ctx[k].closeMultiplying(factor, subCtx[k]));
		return node;
	});
}


module.exports = {
	SimpleAdder,
	NamedAdder,
	CLinearAggregation, CMultiplying,
};
