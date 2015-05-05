var {CUnit, CInteger, CBoolean, CValidate, CNamed, cUnlabelledMember, CSideEffect, CFixedTable, crow} = require("opencpq");

function table(rows) {
	return CFixedTable(mkColumns, rows);
}

function toNum(x = 0) {
	return +x;
}

function E(r) {
	return r == undefined ? undefined : r.E;
}

function P(r) {
	return r == undefined ? undefined : r.P;
}

function delta(r) {
	return r == undefined ? 0 : Math.max(0, toNum(r.P) - toNum(r.E));
}

function epCell(rowName, e_or_p, type) {
	return cUnlabelledMember(e_or_p, CSideEffect(
		(node, {props: p}) => {
			var r = p[rowName];
			if (r == undefined)
				p[rowName] = r = {};
			r[e_or_p] = node.value;
		},
		type
	));
}

function eCell(rowName, type) {
	return epCell(rowName, "E", type);
}

function pCell(rowName, type) {
	return epCell(rowName, "P", type);
}

function mkColumns({props: p}) { 
	if (p.ConfigType === "EXT")
		return [{name: "E", label: "Existing Configuration"}, {name: "P", label: "Planned Configuration"}];
	else
		return [{name: "P", label: "New Configuration"}];
}

function row(name, label, type) {
	return crow(name, label, function ({props: p}) {
		if (p.ConfigType === "EXT")
			return [eCell(name, type), pCell(name, type)];
		else
			return [pCell(name, type)]; // keep name as "P" (preserves values when switching between NEW and EXT), but use label "New"
	});
}

function rowInteger(name, label) {
	return crow(
		name, label,
		({props: p}) =>
			(p.ConfigType === "EXT") ? [
			    eCell(name, CInteger({defaultValue: 0})), 
		        () => {  // "() =>" delays creation of P cell until value of E cell is available
					var exists = E(p[name]);
					return pCell(name, CValidate(
						(node, {error}) => {
		        			if (node.value < exists)
		        				error(`Planned value of '${label}' must not be smaller than existing value.`);
		        		},
		        		CInteger({defaultValue: exists})
		        	))
				}
		    ] : [
				pCell(name, CInteger({defaultValue: 0}))
			]
	);
}

function rowBoolean(name, label) {
	return crow(name, label, function ({props: p}) {
		if (p.ConfigType === "EXT")
			return [
			    eCell(name, CBoolean()), 
			    () => { // "() =>" delays creation of P cell until value of E cell is available
			    	var exists = E(p[name]);
			    	return pCell(name, CBoolean({defaultValue: exists, disabled: exists}))
			    }
			];
		else
			return [pCell(name, CBoolean())];
	});
}

function prow(name, label, type) {
	return crow(name, label, function ({props: p}) {
		if (p.ConfigType === "EXT")
			return [eCell(name, CUnit()), pCell(name, type)];
		else
			return [pCell(name, type)];
	});
}

function isNew(value, test) {
	if (test instanceof Function)
		return !test(E(value)) && test(P(value))
	else 
		return E(value) !== test && P(value) === test;
}

module.exports = {table, toNum, E, P, delta, eCell, pCell, row, prow, rowInteger, rowBoolean, isNew};
