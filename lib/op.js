var {Type} = require("./base");

function COp(fn) {
	return new Type("op", function makeOp(value, updateTo, ctx) {
		return fn(ctx, (ctx, type) => type.makeNode(value, updateTo, ctx));
	});
}

module.exports = {COp};
