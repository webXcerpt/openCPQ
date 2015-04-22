var {
    cmember, cUnlabelledMember, CNamed, CTOCEntry, CLabeled,
	ccase, CBOMEntry,
	CSideEffect,
	CInteger,
	CValidationMessages,
} = require("opencpq");

/**
 * A variant of cmember which also inserts the contained node's value
 * into the "product" name space under the given name.
 */
function cmemberNV(namespace, name, label, type) {
	type = CNamed(namespace, name, {valueAccessor: node => node.value}, type);
	return cmember(name, label, type);
}

/**
 * A variant of cmember which also creates an entry in the table of
 * contents, using the same name and label.
 */
function cmemberTOC(name, label, type) {
	return {name, type: CTOCEntry("", () => label, CLabeled(label, type))};
}

var debug = false;

function ccaseBOM(name, label, type) {
	if (debug)
		label = `[${name}] ${label}`;
	type = CBOMEntry(name, 1, type);
	return ccase(name, label, type);
}

function cintegerBOM(name, options) {
	return CSideEffect((node, {bom}) => bom.add(name, node.value), CInteger(options));
}

function onlyIf(condition, explanation, cases) {
	return condition ? cases : cases.map(c => ({...c, mode: "error", messages: [{level: "error", msg: explanation}]}));
}

function cforbidden(name, condition, explanation) {
	if (condition)
		return cUnlabelledMember(name, CValidationMessages([{level: "error", msg: explanation}]));
}

function cassert(name, condition, explanation) {
	return cforbidden(name, !condition, explanation);
}

module.exports = {
	cmemberNV, cmemberTOC, ccaseBOM, cintegerBOM, onlyIf, cforbidden, cassert
}
