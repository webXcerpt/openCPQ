var React = require("react");

var {
	CWorkbench,
	CGroup, cmember,
	CSelect, ccase, cdefault, unansweredCase,
	CBoolean,
	CInteger,
	CHtml,
	CUnit,
	CNameSpace, CNamed,
	CTOCEntry,
	TOC, Problems, 
	VBOM, VTOC, VProblems, 
	CQuantifiedList,
	CLinearAggregation, SimpleAdder,
	CValidate,
	NamedAdder,
	CSideEffect,
    renderTree, rootPath,
} = require("opencpq");

var {cmemberNV, cmemberTOC, ccaseBOM, onlyIf, cforbidden, cassert} = require("../lib/utils");
var {CPorts} = require("../lib/ports");

// TODO assign materials, images

// TODO move into a file data.js


var allBoards = [
    {name: "B:FP",         label: "unequipped"},
    {name: "B:16x10_32x1", label: "16 x 10 G + 32 x 1 G board", doubleWidth: true, power: 45, ports: [{label: "SFP+ ports",  number: 16, type: "SFP+"}, {label: "SFP ports", number: 32, type: "SFP"}]}, // material, image, ...
    {name: "B:16x10",      label: "16 x 10 G board",                               power: 30, ports: [{label: "SFP+ ports",  number: 16, type: "SFP+"}]},
    {name: "B:32xE1_75",   label: "32 x E1 electrical board (75 Ohm)",             power: 40},
    {name: "B:32xE1_120",  label: "32 x E1 electrical board (120 Ohm)",            power: 40},
    {name: "B:4x40",       label: "4 x 40 G board",                                power: 60, ports: [{label: "QSFP+ ports", number: 4,  type: "QSFP+"}]},
    {name: "B:2x100",      label: "2 x 100 G board",                               power: 60, ports: [{label: "CFP ports",   number: 2,  type: "CFP"}]},
    {name: "B:2xMOD",      label: "module-carrier board for 2 modules",            power: 20, modules: 2},
];

var allModules = [
    {name: "M:FP",       label: "unequipped"},
    {name: "M:8xE1_75",  label: "8 x E1 module (75 Ohm)"  , power: 10},
    {name: "M:8xE1_120", label: "8 x E1 module (120 Ohm)",  power: 10},
    {name: "M:8xE3",     label: "8 x E3 module",            power: 12},
    {name: "M:8xSTM1",   label: "8 x STM-1e module",        power: 12},
    {name: "M:16xFE",    label: "16 x FE module",           power: 20},
    {name: "M:8xGE",     label: "8 x GE module",            power: 15, ports: [{label: "SFP ports", number: 8, type: "SFP"}]},
];

var allTransceivers = [
    {name: "SFP:SX",       label: "SX (850 nm, up to 550 m)",    type: "SFP", power: 0.5},
    {name: "SFP:LX",       label: "LX (1310 nm, up to 10 km)",   type: "SFP", power: 1},
    {name: "SFP:EX",       label: "EX (1310 nm, up to 40 km)",   type: "SFP", power: 2},
    {name: "SFP:ZX",       label: "ZX (1550 nm, up to 80 km)",   type: "SFP", power: 3},
    {name: "SFP:BX",       label: "BX (1490 nm/1310 nm, 10 km)", type: "SFP", power: 1},
    {name: "SFP:1000BT",   label: "1000BASE-T (electrical)",     type: "SFP", power: 0.5},
    {name: "SFP:CWDM40",   label: "CWDM (40 km)",                type: "SFP", power: 1, wavelengths: "CWDM"},
    {name: "SFP:CWDM80",   label: "CWDM (80 km)",                type: "SFP", power: 2, wavelengths: "CWDM"},
    
    {name: "SFP+:SR",      label: "SR (850 nm, up to 300 m)",    type: "SFP+", power: 3},
    {name: "SFP+:LR",      label: "LR (1310 nm, up to 10 km)",   type: "SFP+", power: 3},
    {name: "SFP+:ER",      label: "ER (1550 nm, up to 40 km)",   type: "SFP+", power: 3},
    {name: "SFP+:ZR",      label: "ZR (1550 nm, up to 80 km)",   type: "SFP+", power: 3},
    {name: "SFP+:CWDM40",  label: "CWDM (40 km)",                type: "SFP+", power: 4, wavelengths: "CWDM"},
    {name: "SFP+:CWDM80",  label: "CWDM (80 km)",                type: "SFP+", power: 5, wavelengths: "CWDM"},
    {name: "SFP+:DWDM40",  label: "DWDM (40 km)",                type: "SFP+", power: 4, wavelengths: "DWDM"},
    {name: "SFP+:DWDM80",  label: "DWDM (80 km)",                type: "SFP+", power: 5, wavelengths: "DWDM"},
    
    {name: "QSFP+:SR",     label: "SR (850 nm, up to 300 m)",    type: "QSFP+", power: 1},
    {name: "QSFP+:LR",     label: "LR (1310 nm, up to 10 km)",   type: "QSFP+", power: 3},
    
    {name: "CFP:SR",       label: "SR (850 nm, up to 300 m)",    type: "CFP", power: 1},
    {name: "CFP:LR",       label: "LR (1310 nm, up to 10 km)",   type: "CFP", power: 2},
    {name: "CFP:ER",       label: "ER (1550 nm, up to 40 km)",   type: "CFP", power: 3},
];

var allWavelengths = {
	// This is actually the C band.
	// http://en.wikipedia.org/wiki/Wavelength-division_multiplexing#Dense_WDM
	DWDM: range(191700, 196100, 100).reverse().map(f_GHz => {
		let wl_nm = 299792458 / f_GHz;
		let f_THz = f_GHz / 1000;
		let wl_text = wl_nm.toFixed(2);
		let f_text = f_THz.toFixed(2);
		return {label: `${wl_text} nm / ${f_text} THz`, value: wl_text}
	}),
	CWDM: range(1471, 1611, 20).map(wl_nm => {
		let wl_text = wl_nm.toFixed(2);
		return {label: `${wl_text} nm`, value: wl_text}
	}),
};

function boards(isDoubleWidthSlot) {
	return CSelect(allBoards.map(b =>
		b.doubleWidth && !isDoubleWidthSlot ? 
		undefined :
		ccaseBOM(b.name, b.label,
			aggregate("power", b.power,
				b.ports ? ports(b.ports) :
				b.modules ? modules(b.modules) :
				undefined
		))
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
				m => ccaseBOM(m.name, m.label, m.ports ? aggregate("power", m.power, ports(m.ports)) : undefined)
			)))
		]
	);
}

function transceivers(type) {
	var ps = allTransceivers.filter(pl => pl.type === type);
	if (ps)
		if (ps.length == 0)
			return CHtml(`no transceivers of type ${type}`); // this is an error situation
		else
			return CSelect(ps.map(pl =>	ccaseBOM(pl.name, pl.label, aggregate("power", pl.power, wavelengths(pl.wavelengths)))));
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

function range(from, to, step = 1) {
	var result = [];
	for (var i = from; i <= to; i += step) result.push(i);
	return result;
}

var release =
	cmember("Release", "Release", CSelect([
	    ccase("R1.0", "Rel. 1.0"),
	    ccase("R1.1", "Rel. 1.1"),
	    ccase("R2.0", "Rel. 2.0"),
	]));

function software(p) {
	// TODO only show this "tab" if some parameter is visible
	return cmember("Software", "Software", CGroup([
	    ({solutionProps}) => solutionProps == undefined ? release : undefined,                                    
	    cmember("Licenses", "Licenses", CGroup([
	        (p.Release === "R2.0" ? // TODO also query solutionProps
	            cmember("MPLS-TP", "MPLS-TP", CBoolean({})) :
	            undefined
	        ),
	        ({solutionProps}) => solutionProps == undefined ?
	        	cmember("NetM", "Connection License to Network Management", CBoolean({})) : undefined,
	    ])),                                    
	]));
}

var opticalSwitch4 = CTOCEntry("OS4", () => "Optical Switch OS4", CNameSpace("productProps", CGroup(function({productProps: p}) {	return [
    cmember("Slots", "Slots", CGroup(
    	[for (i of range(1, 4))
    		cmemberNV(`slot${i}`, `Slot ${i}`, boards(false))
        ]
    )),
	software(p),
]})));


var opticalSwitch16 = CTOCEntry("OS16", () => "Optical Switch OS16", CNameSpace("productProps", CGroup(function({productProps: p}) {	return [
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
	software(p),
	/*
	 * power supply: DC if in rack, otherwise select betweek AC and DC
	 */
]})));

var opticalSwitches = [
    ccase("OS4",  "Optical Switch OS4",  aggregate("hu",  6, opticalSwitch4)),
    ccase("OS16", "Optical Switch OS16", aggregate("hu", 11, opticalSwitch16)),
];

function aggregate(what, value, type) {
	return CSideEffect(
		function agg(node, ctx) {
			if (value) {
				var aggregator = ctx[what];
				if (aggregator)
					aggregator.add(value);
			}
		},
		type
	);
}

function CAggregate(what, type) {
	return CLinearAggregation(what, SimpleAdder, CValidate(
		function check(node, {error, info}, ctx) {
			var v = ctx[what].get();
			info(`aggregated ${what}: ${v}`);
		},
		type
	));
}

function CCheckHeightUnits(max, type) {
	return CLinearAggregation("hu", SimpleAdder, CValidate(
		function check(node, {error, info}, {hu}) {
			var v = hu.get();
			if (v > max)
				error(`Height of rack contents (${v}) exceeds maximum number of height units of rack (${max}).`);
		},
		type
	));
}

var rackType =
	cmember("rackType", "Rack type", CSelect([
        ccaseBOM("R:ANSI", "ANSI"),
        ccaseBOM("R:ETSI", "ETSI"),
    ]));

var rack =
	CTOCEntry("rack", () => "Rack",
		CNameSpace("rackProps", 
			CCheckHeightUnits(42,
				CAggregate("power",
					CSideEffect(
						// This code could also be moved to some table.
						function powerDependentRackEquipment(node, {rackProps, bom, power, hu}) {
							var pwr = power.get();
							// uninteruptable power supply
							if (rackProps.UPS) {
								if (pwr <= 500)  { bom.add("UPS:500");     hu.add(1); } else
								if (pwr <= 1000) { bom.add("UPS:1000");    hu.add(2); } else
								if (pwr <= 2000) { bom.add("UPS:2000");    hu.add(4); } else
								                 { bom.add("UPS:2000", 2); hu.add(8); }
							}
							// fans
							if (pwr <= 400)  { bom.add("FAN:3");    hu.add(1); } else
							if (pwr <= 700)  { bom.add("FAN:6");    hu.add(1); } else
							if (pwr <= 1000) { bom.add("FAN:9");    hu.add(1); } else
							                 { bom.add("FAN:9", 2);	hu.add(2); }
						},
						CGroup([
						    ({solutionProps}) => solutionProps == undefined ? rackType : undefined, // TODO use solutionProps.rackType for adding rack to BOM
						    cmember("UPS", "Uninteruptable Power Supply", CNamed("rackProps", "UPS", {valueAccessor: node => node.value}, CBoolean({}))),
						    cmember("switches", "Switches", CQuantifiedList({}, "Product", CSelect(opticalSwitches))),
						])
)))));

var solution = CNameSpace("solutionProps", CGroup([
    cmemberTOC("project", "Project Settings", CGroup([
        release,
        rackType,
    ])),
    cmember("racks", "Racks", CQuantifiedList({}, "Rack", rack)),
    cmemberTOC("management", "Network Management", CGroup([
        cmember("server", "Server type", CSelect([
            ccase("small", "small server"),
            ccase("large", "large server"),
        ])),
        cmember("redundancy", "Redundant server", CBoolean({})),
        cmember("features", "Management Features", CGroup([
            cmember("fault",         "Fault Management",         CBoolean({})),
            cmember("configuration", "Configuration Management", CBoolean({})),
            cmember("accounting",    "Accounting Management",    CBoolean({})),
            cmember("performance",   "Performance Management",   CBoolean({})),
            cmember("security",      "Security Management",      CBoolean({})),
        ])),
    ])),
    // TODO management system and UPS in one special rack
    cmemberTOC("services", "Services", CGroup([
        // TODO some general service level as Silver, Gold, Platin?
        cmember("maintenance",  "Maintenance", CGroup([
            cmember("technicalsupport",    "Technical support",    CSelect([
                ccase("business", "business hours"),
                ccase("24/7",     "24/7"),
            ])),
            cmember("softwareupdates",     "Software updates",     CSelect([
                ccase("download", "via download"),
                ccase("managed",  "managed update"),
             ])),
            cmember("hardwarereplacement", "Hardware replacement", CSelect([
                ccase("next", "next business day"),
                ccase("same", "same day"),
            ])),
        ])),
        cmember("deployment",   "Deployment", CGroup([
            cmember("engineering",  "Engineering",  CBoolean({})),
            cmember("installation", "Installation", CBoolean({})),
            cmember("test",         "Test",         CBoolean({})),
        ])),
        cmember("training",     "Training", CSelect([
            ccase("basic",    "basic training"),
            ccase("advanced", "advanced training"),
        ])),
    ])),
]));

/*
 * TODO
 * some HTML information for each product, including links
 * use react-bootstrap for styling
 * use jquery to download material master data
 */

var configuration = CSelect([
    unansweredCase("Configuration Mode"),
    ccase("Switches", "Optical Switches", CQuantifiedList({}, "Optical Switch", CSelect(opticalSwitches))),
    ccase("Rack",     "Racks",            CQuantifiedList({}, "Rack",           rack)),
    ccase("Solution", "Solution",         solution),
]);

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
				{innerNode.render()}
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

require("./style.css");
