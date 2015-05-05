var React = require("react");

var {
	CWorkbench,
	CGroup, cmember, cUnlabelledMember,
	CSelect, ccase, cdefault, unansweredCase,
	CTable, ccolumn,
	CBoolean,
	CInteger,
	CString,
	CTextarea,
	CDate,
	CTime,
	CEither,
	CQuantified, CQuantifiedList,
	CHtml,
	CUnit,
	CTabbedArea, CPanel, CAccordion,
	CNameSpace, CNamed,
	CLabeled,
	Problems, 
	CValidate,
	CFixedTable, crow,
    renderTree, rootPath,
} = require("opencpq");

var {CPhone} = require("./phone");
var ep = require("./existPlan");
var {CSchedulingTable} = require("./scheduling");

function CExample(name, file, detail, doc) {
	var href = `https://github.com/webXcerpt/openCPQ/blob/master/examples/components/src/${file}`;
	return cUnlabelledMember(name, CPanel({header: name, collapsable: true}, CGroup([
            doc != undefined ? cUnlabelledMember("doc", doc) : undefined,
            cUnlabelledMember("demo", detail),
            cUnlabelledMember("code", CHtml(<a target="_blank" href={href}>Code in GitHub</a>)),
            // TODO code in an iframe would be better:             cUnlabelledMember("code", CHtml(<iframe src={href}/>)),
        ])));
}

var serverSizes = ["small", "medium", "large"];

var configuration = CTabbedArea([
    cmember("Primitive Components", "Primitive Components", CGroup([
        CExample("CUnit",     "index.js", CUnit()),
        CExample("CHtml",     "index.js", CHtml(<div><p>With HTML you can</p><ul><li>Create lists</li><li>create <a href="http://www.opencpq.org">links</a></li></ul></div>)),
        CExample("CBoolean",  "index.js", CBoolean()),
        CExample("CString",   "index.js", CString()),
        CExample("CTextarea", "index.js", CTextarea()),
        CExample("CInteger",  "index.js", CInteger()),
        CExample("CDate",     "index.js", CDate()),
        CExample("CTime",     "index.js", CTime()),
    ])),
    cmember("Compound Components", "Compound Components", CGroup([
        CExample("CSelect", "index.js", CSelect([
            unansweredCase("Please select a fruit"),
            ccase("Apple"),
            ccase("Banana"),
            ccase("Orange"),
            ccase("Other", "Other", CString()),
        ])),
        CExample("CGroup", "index.js", CGroup([
            cmember("Apple", "Apple", CBoolean()),
            cmember("Banana", "Banana", CBoolean()),
            cmember("Orange", "Orange", CBoolean()),
        ])),
        CExample("CTabbedArea", "index.js", CTabbedArea([
            cmember("Apple", "Apple", CHtml("This is an apple.")),
            cmember("Banana", "Banana", CHtml("This is a banana.")),
            cmember("Orange", "Orange", CHtml("This is an orange.")),
        ])),
        CExample("CAccordion", "index.js", CAccordion([
            cmember("Apple", "Apple", CHtml("This is an apple.")),
            cmember("Banana", "Banana", CHtml("This is a banana.")),
            cmember("Orange", "Orange", CHtml("This is an orange.")),
        ])),
        CExample("CEither", "index.js", CEither({}, CHtml("either"), CHtml("or"))),
        CExample("CTable", "index.js", CTable({}, [ccolumn("name", "Name"), ccolumn("age", "Age")], CGroup([cUnlabelledMember("name", CString()), cUnlabelledMember("age", CInteger())]))),
        CExample("CQuantified", "index.js", CQuantified(CString())),
        CExample("CQuantifiedList", "index.js", CQuantifiedList({}, "string", CString())),
    ])),
    cmember("Application-Specific Components", "Application-Specific Components", CGroup([
        CExample("CPhone", "phone.js", CPhone(), CHtml(<p>Phone numbers in the US and Canada have to confirm to a certain syntax.</p>)),
        CExample("CFixedTable", "fixedTable.js", CFixedTable([{name: "A", label: "A"}, {name: "B", label: "B"}, {name: "C", label: "C"}], [
             crow("1", "1", [cUnlabelledMember("A1", CBoolean()), cUnlabelledMember("B1", CBoolean()), cUnlabelledMember("C1", CBoolean())]),
             crow("2", "2", [cUnlabelledMember("A2", CBoolean()), cUnlabelledMember("B2", CBoolean()), cUnlabelledMember("C2", CBoolean())]),
             crow("3", "3", [cUnlabelledMember("A3", CBoolean()), cUnlabelledMember("B3", CBoolean()), cUnlabelledMember("C3", CBoolean())]),
        ])),
        CExample("Exist-Plan", "existPlan.js",
        	CNameSpace("props", CGroup([
			    cmember("ConfigType", "Configuration Type",
			    	CNamed("props", "ConfigType", {valueAccessor: n => n.value}, CSelect([
			    	    ccase("NEW", "New Configuration"),
					    ccase("EXT", "Upgrade / Extension"),
				]))),
				cmember("Server", "Server", ep.table([
                    ep.rowInteger("clients", "Connected clients"), 
				    crow("Size", "Server size", ({props}) =>
				    	props.ConfigType === "EXT"
				    	? [ep.eCell("Size", CSelect([for (s of serverSizes) ccase(s)])),
					       () => 
				    	   ep.pCell("Size", CSelect([for (s of serverSizes)
				    		   onlyIf(serverSizes.indexOf(s) >= serverSizes.indexOf(ep.E(props.Size)), "Downgrade not supported", [ccase(s)])]))
					      ]
						: [ep.pCell("Size", CSelect([for (s of serverSizes) ccase(s)]))]
					),
					ep.rowBoolean("redundancy", "Redundant server"), 
				])),
		    ])),
			CHtml(<p></p>)
		),
        CExample("CSchedulingTable", "scheduling.js", CNameSpace("props", CGroup([
            cmember("days",  "Number of Days",  CNamed("props", "days",  {valueAccessor: n => n.value}, CInteger({defaultValue: 5}))),
            cmember("tasks", "Number of Tasks", CNamed("props", "tasks", {valueAccessor: n => n.value}, CInteger({defaultValue: 3}))),
        	({props}) => cUnlabelledMember("table", CSchedulingTable(props.tasks, props.days)),
        ]))),
        CExample("CExample", "index.js", CGroup([CExample("CExample", "index.js", CSelect([
	            unansweredCase("Please select a fruit"),
	            ccase("Apple"),
	            ccase("Banana"),
	            ccase("Orange"),
	        ]), CHtml("CExample used as example"))
	    ])),
    ])),
]);

function onlyIf(condition, explanation, cases) {
	return condition ? cases : cases.map(c => ({...c, mode: "error", messages: [{level: "error", msg: explanation}]}));
}

var workbench = CWorkbench(
	ctx => ctx,
	(innerNode, ctx) => innerNode.render(),
	configuration
);

renderTree(
	workbench,
	undefined,
	() => ({
		path: rootPath,
		problems: new Problems(),
	}),
	document.getElementsByTagName("body")[0]
);
