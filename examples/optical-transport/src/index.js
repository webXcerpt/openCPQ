var React = require("react");

var {
	packed,
	CWorkbench,
	CGroup, cmember,
	CSelect, ccase, cdefault, unansweredCase,
	CInteger,
	CHtml,
	CUnit,
	CNameSpace,
	CTOCEntry,
	TOC, Problems, 
	VBOM, VTOC, VProblems, 
	CQuantifiedList,
	NamedAdder,
    renderTree, rootPath,
} = require("opencpq");

var {cmemberNV, cmemberTOC, ccaseBOM, onlyIf, cforbidden, cassert} = require("../lib/utils");
var {CPorts} = require("../lib/ports");

// TODO
// two types of switch - smaller and larger, with overlapping set of boards
// perhaps use a function to construct a "switch"

// TODO assign materials, images

// TODO move into a file data.js

var allBoards = [
    {name: "FPB",         label: "unequipped"},
    {name: "B16x10_32x1", label: "16 x 10 G + 32 x 1 G board", doubleWidth: true, ports: [{label: "SFP+ ports",  number: 16, type: "SFP+"}, {label: "SFP ports", number: 32, type: "SFP"}]}, // material, image, ...
    {name: "B16x10",      label: "16 x 10 G board",                               ports: [{label: "SFP+ ports",  number: 16, type: "SFP+"}]},
    {name: "B32xE1_75",   label: "32 x E1 electrical board (75 Ohm)"},
    {name: "B32xE1_120",  label: "32 x E1 electrical board (120 Ohm)"},
    {name: "B4x40",       label: "4 x 40 G board",                                ports: [{label: "QSFP+ ports", number: 4,  type: "QSFP+"}]},
    {name: "B2x100",      label: "2 x 100 G board",                               ports: [{label: "CFP ports",   number: 2,  type: "CFP"}]},
    {name: "B2xMOD",      label: "module-carrier board for 2 modules",            modules: 2},
];

var allModules = [
    {name: "FPM",       label: "unequipped"},
    {name: "M8xE1_75",  label: "8 x E1 module (75 Ohm)"},
    {name: "M8xE1_120", label: "8 x E1 module (120 Ohm)"},
    {name: "M8xE3",     label: "8 x E3 module"},
    {name: "M8xSTM1",   label: "8 x STM-1e module"},
    {name: "M16xFE",    label: "16 x FE module"},
    {name: "M8xGE",     label: "8 x GE module",            ports: [{label: "SFP ports", number: 8, type: "SFP"}]},
];

var allTransceivers = [
    {name: "SX",       label: "SX (850 nm, up to 550 m)",    type: "SFP"},
    {name: "LX",       label: "LX (1310 nm, up to 10 km)",   type: "SFP"},
    {name: "EX",       label: "EX (1310 nm, up to 40 km)",   type: "SFP"},
    {name: "ZX",       label: "ZX (1550 nm, up to 80 km)",   type: "SFP"},
    {name: "BX",       label: "BX (1490 nm/1310 nm, 10 km)", type: "SFP"},
    {name: "1000BT",   label: "1000BASE-T (electrical)",     type: "SFP"},
    {name: "CWDM40",   label: "CWDM (40 km)",                type: "SFP", wavelengths: "CWDM"},
    {name: "CWDM80",   label: "CWDM (80 km)",                type: "SFP", wavelengths: "CWDM"},
    
    {name: "SR",       label: "SR (850 nm, up to 300 m)",    type: "SFP+"},
    {name: "LR",       label: "LR (1310 nm, up to 10 km)",   type: "SFP+"},
    {name: "ER",       label: "ER (1550 nm, up to 40 km)",   type: "SFP+"},
    {name: "ZR",       label: "ZR (1550 nm, up to 80 km)",   type: "SFP+"},
    {name: "CWDM40",   label: "CWDM (40 km)",                type: "SFP+", wavelengths: "CWDM"},
    {name: "CWDM80",   label: "CWDM (80 km)",                type: "SFP+", wavelengths: "CWDM"},
    {name: "DWDM40",   label: "DWDM (40 km)",                type: "SFP+", wavelengths: "DWDM"},
    {name: "DWDM80",   label: "DWDM (80 km)",                type: "SFP+", wavelengths: "DWDM"},
    
    {name: "SR",       label: "SR (850 nm, up to 300 m)",    type: "QSFP+"},
    {name: "LR",       label: "LR (1310 nm, up to 10 km)",   type: "QSFP+"},
    
    {name: "SR",       label: "SR (850 nm, up to 300 m)",    type: "CFP"},
    {name: "LR",       label: "LR (1310 nm, up to 10 km)",   type: "CFP"},
    {name: "ER",       label: "ER (1550 nm, up to 40 km)",   type: "CFP"},
];

var allWavelengths = {
	DWDM: [
		{label: "1529.553 nm", value: 1529.553},
		{label: "1530.334 nm"},
		{label: "1531.115 nm"},
		{label: "1531.898 nm"},
		{label: "1532.681 nm"},
		{label: "1533.465 nm"},
		{label: "1534.250 nm"},
		{label: "1535.035 nm"},
		{label: "1535.822 nm"},
		{label: "1536.609 nm"},
		{label: "1537.397 nm"},
		{label: "1538.186 nm"},
		{label: "1538.975 nm"},
		{label: "1539.766 nm"},
		{label: "1540.557 nm"},
		{label: "1541.349 nm"},
		{label: "1542.142 nm"},
		{label: "1542.936 nm"},
		{label: "1543.730 nm"},
		{label: "1544.526 nm"},
		{label: "1545.322 nm"},
		{label: "1546.119 nm"},
		{label: "1546.917 nm"},
		{label: "1547.715 nm"},
		{label: "1548.514 nm"},
		{label: "1549.315 nm"},
		{label: "1550.116 nm"},
		{label: "1550.918 nm"},
		{label: "1551.720 nm"},
		{label: "1552.524 nm"},
		{label: "1553.328 nm"},
		{label: "1554.134 nm"},
		{label: "1554.940 nm"},
		{label: "1555.747 nm"},
		{label: "1556.555 nm"},
		{label: "1557.363 nm"},
		{label: "1558.173 nm"},
		{label: "1558.983 nm"},
		{label: "1559.794 nm"},
		{label: "1560.606 nm"},
		{label: "1561.419 nm"},
		{label: "1562.232 nm"},
		{label: "1563.047 nm"},
		{label: "1563.862 nm"},
	],
	CWDM: [
		{label: "1471 nm"},
		{label: "1491 nm"},
		{label: "1511 nm"},
		{label: "1531 nm"},
		{label: "1551 nm"},
		{label: "1571 nm"},
		{label: "1591 nm"},
		{label: "1611 nm"},
	],
};

function boards(isDoubleWidthSlot) {
	return CSelect(allBoards.map(b =>
		b.doubleWidth && !isDoubleWidthSlot ? 
		undefined :
		ccase(b.name, b.label,
			b.ports ? ports(b.ports) :
			b.modules ? modules(b.modules) :
			undefined
		)
	));
}

function ports(ps) {
	return CGroup(ps.map(
		p => cmember(`port${p.type}`, p.label, CPorts(p.number, transceivers(p.type)))
	));
}

function modules(number) {
	return CGroup(
		[for (i of range(1, number))
			cmember(`module${i}`, `Module ${i}`, CSelect(allModules.map(
				m => ccase(m.name, m.label, m.ports ? ports(m.ports) : undefined)
			)))
		]
	);
}

function transceivers(type) {
	var ps = allTransceivers.filter(pl => pl.type === type);
	if (ps)
		if (ps.length == 0)
			return CHtml(`no transceivers of type ${type}`);
		else
			return CSelect(ps.map(pl =>	ccase(pl.name, pl.label, wavelengths(pl.wavelengths))));
	else
		return undefined;
}

function wavelengths(type) {
	var wls = allWavelengths[type];
	if (wls)
		return CSelect(wls.map(wl => ccase(wl.label, wl.label, undefined)));
	else
		return undefined;
}

function hasDoubleWidth(n) {
	return allBoards.find(b => b.name === n).doubleWidth;
}

function range(from, to) {
	var result = [];
	for (var i = from; i <= to; i++) result.push(i);
	return result;
}

var opticalSwitch4 = CNameSpace("productProps", CGroup(function({productProps: p}) {	return [
    cmember("Slots", "Slots", CGroup(
    	[for (i of range(1, 4))
    		cmemberNV(`slot${i}`, `Slot ${i}`, boards(false))
        ]
    )),
	cmember("Software", "Software", CGroup([
	])),
]}));


var opticalSwitch16 = CNameSpace("productProps", CGroup(function({productProps: p}) {	return [
    cmember("Slots", "Slots", CGroup(
    	[for (i of range(1, 16))
    		() =>
    		cmemberNV(`slot${i}`, `Slot ${i}`, 
				i % 2 === 0 && hasDoubleWidth(p[`slot${i-1}`]) ?
				CHtml("occupied") :
				boards(i % 2 === 1)
    		)
        ]
    )),
	cmember("Software", "Software", CGroup([
	])),
	
	/*
	 * power supply
	 * 
	 * 16 Interface Slots: populate via for loop
	 *   - double-width boards (only in slots with odd slot numbers)
	 *   - module-carrier boards (deeper hierarchy)
	 *   - capacity restrictions
	 *   
	 * 2 uplink slots 
	 * 
	 * software:
	 *   version
	 *   special licenses
	 *   connection to management system
	 *
	 */
	
]}));

var opticalSwitches = [
    ccase("OS4",  "Optical Switch OS4",  opticalSwitch4),
    ccase("OS16", "Optical Switch OS16", opticalSwitch16),
];

var management = CGroup([]);
/*
 * TODO
 * version
 * software
 * licenses
 * update
 * 
 * 
 * 
 */


var rack = CGroup([
    cmember("type", "Rack type", CSelect([
        ccase("ANSI", "ANSI"),
        ccase("ETSI", "ETSI"),
    ])),
    cmember("switches", "Switches", CQuantifiedList({}, "Product", CSelect(opticalSwitches))),
]);

var services = CGroup([]);

// TODO
// installation
// spare part exchange
// maintenance

var solution = CGroup([]);

/*
 * TODO
 * configure single boxes or configure solution
 *   single boxes: shopping list structure of boxes
 *   single rack
 *   solution:
 *     general configuration parameters (sw version, rack height, rack type)
 *     list of racks
 *       rack contains boxes
 *     management system
 *       new or extension
 *     services
 */

/*
 * TODO
 * some HTML information for each product, including links
 * use react-bootstrap for styling
 * use jquery to download material master data
 */

var configuration = CQuantifiedList({}, "Configuration", CSelect([
    unansweredCase("Select Configuration"),
    opticalSwitches,
    ccase("Rack", "Rack", rack),
]));

var itemList = []; // TODO fill itemList

var workbench = CWorkbench(
	ctx => ({toc: VTOC(ctx), bom: VBOM(itemList, ctx), problems: VProblems(ctx)}),
	(innerNode, {toc, bom, problems}) => {
		function colStyle(percentage) {
			return {
				display: "inline-block",
				verticalAlign: "top",
				width: `${percentage}%`,
				height: "100%",
				overflow: "auto"
			};
		}
		function rowStyle(percentage) {
			return {height: `${percentage}%`, overflow: "auto"};
		}
		return <div>
			<div style={colStyle(15)}>
				<h3>Contents</h3>
				{toc.render()}
			</div>
			<div style={colStyle(50)}>
				<h3>Configuration</h3>
				{packed(innerNode.renderHB())}
			</div>
			<div style={colStyle(35)}>
				<div style={rowStyle(70)}>
					<h3>Bill of Materials</h3>
					{bom.render()}
				</div>
				<div style={rowStyle(30)}>
					<h3>Problems</h3>
					{problems.render()}
				</div>
			</div>
		</div>; // TODO: Use tabs for bom/problems?
	},
	configuration
);

renderTree(
	workbench,
	undefined,
	() => ({
		path: rootPath,
		toc: new TOC(),
		bom: new NamedAdder(),
		linearAggregators: ["bom"],
		problems: new Problems(),
	}),
	document.getElementsByTagName("body")[0]
);
