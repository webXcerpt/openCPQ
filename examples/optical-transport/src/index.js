var React = require("react");

var {
	CWorkbench,
	CGroup, cmember, cUnlabelledMember,
	CSelect, ccase, cdefault, unansweredCase,
	CBoolean,
	CInteger,
	CEither,
	CHtml,
	CUnit,
	CNameSpace,
	CTOCEntry,
	CBOMEntry,
	TOC, Problems, 
	VTOC, VProblems, 
	CQuantifiedList,
	CLinearAggregation, SimpleAdder,
	CValidate,
	NamedAdder,
	CSideEffect,
    renderTree, rootPath,
} = require("opencpq");

var {
	PanelGroup, Panel, 
	TabbedArea, TabPane,
} = require("react-bootstrap");

var {cmemberNV, cmemberTOC, ccaseBOM, cintegerBOM, onlyIf, cforbidden, cassert} = require("../lib/utils");
var {CPorts} = require("../lib/ports");
var {VBOM} = require("../lib/bom.js"); // specific BOM implementation

// TODO assign images

var components = require("../resources/components.json");

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
	return CSelect([
		for (b of components.boards)
			if (!b.doubleWidth || isDoubleWidthSlot)
				ccaseBOM(b.name, b.label,
					aggregate("power", b.power,
						b.ports ? ports(b.ports) :
						b.modules ? modules(b.modules) :
						undefined))
	]);
}

function ports(ps) {
	return CGroup([
		for (p of ps)
			cmember(`port${p.type}`, p.label, CPorts(p.number, transceivers(p.type)))
	]);
}

function modules(number) {
	return CGroup([
		for (i of range(1, number))
			cmember(`module${i}`, `Module ${i}`, CSelect([
				for (m of components.modules)
					ccaseBOM(m.name, m.label, m.ports ? aggregate("power", m.power, ports(m.ports)) : undefined)
			]))
	]);
}

function transceivers(type) {
	var ts = components.transceivers.filter(t => t.type === type);
	if (ts) {
		if (ts.length == 0)
			return CHtml(`Internal error: no transceivers of type ${type}`);
		else
			return CSelect(ts.map(t => {
				var wls = wavelengths(t.name, t.wavelengths);
				return ccase(t.name, t.label,
							 aggregate("power", t.power,
									   wls ? wls : CBOMEntry(t.name, 1, CUnit())));
			}));
	}
}

function wavelengths(master, type) {
	var wls = allWavelengths[type];
	if (wls)
		return CSelect([
			for (wl of wls)
				ccaseBOM(`${master}:${wl.value}`, wl.label, undefined)
		]);
}

function hasDoubleWidth(n) {
	return components.boards.find(b => b.name === n).doubleWidth;
}

function range(from, to, step = 1) {
	var result = [];
	for (var i = from; i <= to; i += step) result.push(i);
	return result;
}

var release = CSelect([
	    ccase("R1.0", "Rel. 1.0"),
	    ccase("R1.1", "Rel. 1.1"),
	    ccase("R2.0", "Rel. 2.0"),
	]);

function getFromProps(propsList, property) {
	for (var props of propsList) {
		if (props != undefined) {
			var v = props[property];
			if (v != undefined)
				return v;
			}
	};
}

function opticalSwitchBOM(name) {
	return function (node, {solutionProps, productProps, bom}) {
		bom.add(`CH:${name}`); // construct a material name
		switch (getFromProps([productProps, solutionProps], "release")) {
		case "R1.0": bom.add(`SW:${name}:10`); break;
		case "R1.1": bom.add(`SW:${name}:11`); break;
		case "R2.0": bom.add(`SW:${name}:20`); break;
		};
		if (productProps.NetM) // NetM might not be existing or not available - handle with same code
			bom.add(`NM:${name}`);
		if (productProps["MPLS-TP"]) // property name which is not an identifier
			bom.add("LIC:MPLS-TP");
	};
}

function software({solutionProps, productProps}) {
	if (solutionProps == undefined || solutionProps.release === "R2.0") {
		return cmember("Software", "Software and Licenses", CGroup([
		    solutionProps == undefined
				? cmemberNV("productProps", "release", "Release", release)
				: undefined,
		    cmember("Licenses", "Licenses", CGroup([
		        () =>
					getFromProps([productProps, solutionProps], "release") === "R2.0"
						? cmemberNV("productProps", "MPLS-TP", "MPLS-TP", CBoolean({}))
						: undefined,
		        solutionProps == undefined
					? cmemberNV("productProps", "NetM", "Connection License to Network Management", CBoolean({}))
					: undefined,
            ])),
        ]));
	}
};

var opticalSwitch4 =
	CSideEffect(
		opticalSwitchBOM("OS4"),
		CGroup([
		    [for (i of range(1, 4))
		    	cmember(`slot${i}`, `Slot ${i}`, boards(false))
		    ],
		    software,
	    ])
	);

var opticalSwitch6 =
	CSideEffect(
		opticalSwitchBOM("OS6"),
		CGroup(({productProps: p}) => [
		    [for (i of range(1, 6))
				() =>
					cmemberNV("productProps", `slot${i}`, `Slot ${i}`, 
						i % 2 === 0 && hasDoubleWidth(p[`slot${i-1}`])
							? CHtml(<i>occupied</i>)
							: boards(i % 2 === 1)
					)
		    ],
		    software,
	    ])
	);

var opticalSwitch16 =
	CSideEffect(
		opticalSwitchBOM("OS16"),
		CGroup(({productProps: p}) => [
		    [for (i of range(1, 16))
				() =>
					cmemberNV("productProps", `slot${i}`, `Slot ${i}`, 
						i % 2 === 0 && hasDoubleWidth(p[`slot${i-1}`])
							? CHtml(<i>occupied</i>)
							: boards(i % 2 === 1)
					)
		    ],
		    software,
	    // TODO power supply: DC if in rack, otherwise select betweek AC and DC
		])
	);

var opticalSwitches = CTOCEntry(
	"switch",
	(node, {rowIndex, quantity}) => `#${rowIndex+1}: ${quantity === 1 ? "" : `${quantity} \u00d7`} ${node.value}`,
	CNameSpace("productProps", CSelect([
		ccase("OS4",  "Optical Switch OS4",  aggregate("networkElements", 1, aggregate("hu",  6, opticalSwitch4))),
		ccase("OS6",  "Optical Switch OS6",  aggregate("networkElements", 1, aggregate("hu",  8, opticalSwitch6))),
		ccase("OS16", "Optical Switch OS16", aggregate("networkElements", 1, aggregate("hu", 11, opticalSwitch16))),
	]))
);

// Add the given value (if present) to the aggregator with the given
// name from the context (if present).  Otherwise behave like the given
// type.
function aggregate(name, value = 0, type) {
	return CSideEffect(
		(node, {[name]: aggregator}) => aggregator && aggregator.add(value),
		type
	);
}

// Declare an aggregator with the given name that is accessible during
// the configuration of the given type.  After that configuration emit a
// message about the aggregation result.
function CAggregate(name, mkInfoMessage, type) {
	return CLinearAggregation(name, SimpleAdder,
		CValidate(
			(node, {info}, {[name]: aggregator}) =>	info(mkInfoMessage(aggregator.get())), 
			type
		));
}

function CCheckHeightUnits(max, type) {
	return CLinearAggregation("hu", SimpleAdder, CValidate(
		(node, {error}, {hu}) => {
			var v = hu.get();
			if (v > max)
				error(`Height of rack contents (${v}) exceeds maximum number of height units of rack (${max}).`);
		},
		type
	));
}

// rackType can be used as a group member on multiple levels.  It only
// "materializes" if we do not yet have an "inherited" value.
var rackType = ({inheritableRackProps}) => {
	if (inheritableRackProps.rackType == undefined)
		return cmemberNV("inheritableRackProps", "rackType", "Rack Type", CSelect([
			ccase("R:ANSI", "ANSI"),
			ccase("R:ETSI", "ETSI"),
		]));
};

var rack =
	CTOCEntry("rack", (node, {rowIndex, quantity}) => `#${rowIndex+1}: ${quantity === 1 ? "Rack" : `${quantity} Racks`}`,
		CNameSpace("rackProps", 
			CCheckHeightUnits(42,
				CAggregate("power", v => `Total power consumption: ${v} W`,
					CSideEffect(
						function rackEquipment(node, {inheritableRackProps, rackProps, bom, power, hu}) {
							bom.add(inheritableRackProps.rackType);
							// The following code could also be moved to some table.
							var pwr = power.get();
							// uninterruptible power supply
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
						CGroup(({solutionProps}) => [
							rackType,
						    cmemberNV("rackProps", "UPS", "Uninterruptible Power Supply", CBoolean({defaultValue: solutionProps == undefined ? undefined : solutionProps.UPS})),
						    cmember("switches", "Switches", CQuantifiedList({}, "Product", opticalSwitches)),
						])
)))));

var solution = CNameSpace("solutionProps", CAggregate("networkElements", v => `Total number of network elements: ${v}`, CGroup([
    // parameters to be inherited
    cmemberTOC("project", "Project Settings", CGroup([
        cmemberNV("solutionProps", "release", "Release", release),
        rackType,
		cmemberNV("solutionProps", "UPS", "Uninterruptible Power Supply (default for each rack)", CBoolean({})),
    ])),
    cmember("racks", "Racks", CQuantifiedList({}, "Rack", rack)),
    ({networkElements}) => cmemberTOC("management", "Network Management", CGroup([
        cmemberNV("solutionProps", "ne", "Number of managed network elements", CInteger({defaultValue: networkElements.get()})),
        ({solutionProps}) => cmember("server", "Server Type", CSelect([
            onlyIf(solutionProps.ne <= 20,  "Small server not sufficient for more than 20 managed network elements",    [ccase("small",  "small server")]),
            onlyIf(solutionProps.ne <= 100, "Medium server not sufficient for more than 100 manageed network elements", [ccase("medium", "medium server")]),
            ccase("large", "large server"),
        ])),
        cmember("redundancy", "Redundant Server", CBoolean({})), // TODO redundant server only for medium or large
        cmember("features", "Management Features", CGroup([
            cmember("fault",         "Fault Management",         CBoolean({defaultValue: true})),
            cmember("configuration", "Configuration Management", CBoolean({defaultValue: true})),
            cmember("accounting",    "Accounting Management",    CBoolean({defaultValue: true})),
            cmember("performance",   "Performance Management",   CBoolean({defaultValue: true})),
            cmember("security",      "Security Management",      CBoolean({defaultValue: true})),
        ])),
    ])),
    // TODO management system and UPS in one special rack
    cmemberTOC("services", "Services", CNameSpace("serviceProps", CSideEffect(
		(node, {serviceProps, bom}) => {
			// TODO calculate BOM
	    },
		CGroup([
	        // TODO some general service level as Silver, Gold, Platinum?
	        cmember("maintenance",  "Maintenance", CGroup([
	            cmemberNV("serviceProps",
						  "technicalsupport",  "Technical Support",    CSelect([
	                ccase("business", "business hours"),
	                cdefault(ccase("24/7",     "24/7")),
	            ])),
	            cmember("softwareupdates",     "Software Updates",     CSelect([
	                ccase("download", "via download"),
	                cdefault(ccase("managed",  "managed update")),
	             ])),
	            cmember("hardwarereplacement", "Hardware Replacement", CSelect([
	                ccase("next", "next business day"),
	                ccase("same", "same day"),
	            ])),
	        ])),
	        cmember("deployment",   "Deployment", CGroup([
	            cmember("engineering",  "Engineering",  CBoolean({defaultValue: true})),
	            cmember("installation", "Installation", CBoolean({defaultValue: true})),
	            cmember("test",         "Test",         CBoolean({defaultValue: true})),
	        ])),
	        cmember("training", "Training", CGroup([
	            cmember("basic", "Basic Training", CEither({}, CGroup([
	                cmemberNV("serviceProps", "basicSeats",    "Number of Seats", cintegerBOM("TR:BASIC", {defaultValue: 0})),
	            ]))),
	            cmember("advanced", "Advanced Training", CEither({}, CGroup(({serviceProps}) => [
	                cmember("advancedSeats", "Number of Seats", CValidate(
						(node, {warning}, {serviceProps}) => {
	                		if (serviceProps.basicSeats < node.value)
	                			warning("Advanced training requires basic training.");
						},
						cintegerBOM("TR:ADVANCED", {defaultValue: serviceProps.basicSeats}))),
	            ]))),
	        ])),
    ])))),
])));

/*
 * TODO
 * some HTML information for each product, including links
 */

var configuration = CSelect([
    unansweredCase("Select Configuration Mode"),
    ccase("Switches", "Optical Switches", CQuantifiedList({}, "Optical Switch", opticalSwitches)),
    ccase("Rack",     "Racks",            CQuantifiedList({}, "Rack",           CNameSpace("inheritableRackProps", rack))),
    ccase("Solution", "Solution",         CNameSpace("inheritableRackProps", solution)),
]);

var workbench = CWorkbench(
	ctx => ({toc: VTOC(ctx), bom: VBOM(ctx), problems: VProblems(ctx)}),
	(innerNode, {toc, bom, problems}) => {
		function colStyle(percentage) {
			return {
				display: "inline-block",
				verticalAlign: "top",
				width: `${percentage}%`,
				height: "100%",
			};
		}
		return <div>
			<div style={colStyle(70)}>
				<PanelGroup>
					<Panel header={<h3>Configuration</h3>}>
						{innerNode.render()}
					</Panel>
				</PanelGroup> 
			</div>
			<div style={colStyle(30)}>
				<PanelGroup>
					<Panel collapsable header={<h3>Contents</h3>}>
						{toc.render()}
					</Panel>
					<Panel collapsable defaultExpanded header={<h3>Bill of Materials</h3>}>
						{bom.render()}
					</Panel>
					<Panel collapsable header={<h3>Problems</h3>}>
						{problems.render()}
					</Panel>
				</PanelGroup>
			</div>
		</div>;
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
		linearAggregators: ["bom"], // TODO add other linear aggregators?
		problems: new Problems(),
	}),
	document.getElementsByTagName("body")[0]
);
