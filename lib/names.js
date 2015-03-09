var {Type} = require("./base");
var {CSideEffect} = require("./util");

function CNameSpace(nameSpaceName, type) {
	return new Type("nameSpace", function makeNameSpace(ctx) {
		return type.makeNode({...ctx, [nameSpaceName]: {}});
	});
}

var identity = x => x;

function CNamed(nameSpaceName, name, {valueAccessor = identity}, type) {
	return CSideEffect(
		function setName(node, ctx) {
			return ctx[nameSpaceName][name] = valueAccessor(node);
		},
		type
	);
}

module.exports = {CNameSpace, CNamed};
