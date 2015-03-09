var {Type} = require("./base");
var {CUnit} = require("./primitives");

function CSideEffect(fn, type = CUnit()) {
	return new Type("sideEffect", function makeSideEffect(ctx) {
		var node = type.makeNode(ctx);
		fn(node, ctx);
		return node;
	});
}

module.exports = {CSideEffect};
