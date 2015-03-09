var {Type} = require("./base");

function COp(fn) {
	return new Type("op", function makeOp(ctx) {
		return fn(ctx, (ctx, type) => type.makeNode(ctx));
	});
}

module.exports = {COp};
