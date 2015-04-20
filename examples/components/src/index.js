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
	CNameSpace,
	Problems, 
	CQuantifiedList,
	CLinearAggregation, SimpleAdder,
	CValidate,
	NamedAdder,
	CSideEffect,
    renderTree, rootPath,
} = require("opencpq");


var phonePattern = /^\s*\(\d\d\d\)\s*\d\d\d-\d\d\d\d\s*$/;
function CPhone() {
	return CValidate(
		(n, cb, ctx) => {
			if (!phonePattern.test(n.value))
				cb.error("Enter a phone number in the format \"(999) 999-9999\"");
		},
		CString()
	);
}

var configuration = CTabbedArea([
    cmember("Primitive Components", "Primitive Components", CGroup([
        cUnlabelledMember("CUnit", CPanel({header: "CUnit", collapsable: true}, CGroup([
            cmember("demo", "demo", CUnit()),
            cmember("code", "code", CHtml(<pre>CUnit()</pre>)),
        ]))),
        cUnlabelledMember("CHtml", CPanel({header: "CHtml", collapsable: true}, CGroup([
            cmember("demo", "demo", CHtml(<div><p>With HTML you can</p><ul><li>Create lists</li><li>create <a href="http://www.opencpq.org">links</a></li></ul></div>)),
            cmember("code", "code", CHtml(<pre>CHtml(<div><p>With HTML you can</p><ul><li>create lists</li><li>create <a href="http://www.opencpq.org">links</a></li></ul></div>)</pre>)),
        ]))),
        cUnlabelledMember("CBoolean", CPanel({header: "CBoolean", collapsable: true}, CGroup([
            cmember("demo", "demo", CBoolean()),
            cmember("code", "code", CHtml(<pre>CBoolean()</pre>)),
        ]))),
        cUnlabelledMember("CString", CPanel({header: "CString", collapsable: true}, CGroup([
            cmember("demo", "demo", CString()),
            cmember("code", "code", CHtml(<pre>CString()</pre>)),
        ]))),
        cUnlabelledMember("CTextArea", CPanel({header: "CTextArea", collapsable: true}, CGroup([
            cmember("demo", "demo", CTextarea()),
            cmember("code", "code", CHtml(<pre>CTextarea()</pre>)),
        ]))),
        cUnlabelledMember("CInteger", CPanel({header: "CInteger", collapsable: true}, CGroup([
            cmember("demo", "demo", CInteger()),
            cmember("code", "code", CHtml(<pre>CInteger()</pre>)),
        ]))),
        cUnlabelledMember("CDate", CPanel({header: "CDate", collapsable: true}, CGroup([
            cmember("demo", "demo", CDate()),
            cmember("code", "code", CHtml(<pre>CDate()</pre>)),
        ]))),
        cUnlabelledMember("CTime", CPanel({header: "CTime", collapsable: true}, CGroup([
            cmember("demo", "demo", CTime()),
            cmember("code", "code", CHtml(<pre>CTime()</pre>)),
        ]))),
    ])),
    cmember("Compound Components", "Compound Components", CGroup([
        cUnlabelledMember("CSelect", CPanel({header: "CSelect", collapsable: true}, CGroup([
            cmember("demo", "demo", CSelect([
                unansweredCase("Please select a fruit"),
                ccase("Apple"),
                ccase("Banana"),
                ccase("Orange"),
            ])),
            cmember("code", "code", CHtml(<pre>CSelect([
                unansweredCase("Please select a fruit"),
                ccase("Apple"),
                ccase("Banana"),
                ccase("Orange"),
            ])</pre>)),
        ]))),
        cUnlabelledMember("CGroup", CPanel({header: "CGroup", collapsable: true}, CGroup([
            cmember("demo", "demo", CGroup([
                cmember("Apple", "Apple", CBoolean()),
                cmember("Banana", "Banana", CBoolean()),
                cmember("Orange", "Orange", CBoolean()),
            ])),
            cmember("code", "code", CHtml(<pre>CGroup([
                cmember("Apple", "Apple", CBoolean()),
                cmember("Banana", "Banana", CBoolean()),
                cmember("Orange", "Orange", CBoolean()),
            ])</pre>)),
        ]))),
        cUnlabelledMember("CTabbedArea", CPanel({header: "CTabbedArea", collapsable: true}, CGroup([
            cmember("demo", "demo", CTabbedArea([
                cmember("Apple", "Apple", CHtml("This is an apple.")),
                cmember("Banana", "Banana", CHtml("This is a banana.")),
                cmember("Orange", "Orange", CHtml("This is an orange.")),
            ])),
            cmember("code", "code", CHtml(<pre>CTabbedArea([
                cmember("Apple", "Apple", CHtml("This is an apple.")),
                cmember("Banana", "Banana", CHtml("This is a banana.")),
                cmember("Orange", "Orange", CHtml("This is an orange.")),
            ])</pre>)),
        ]))),
        cUnlabelledMember("CAccordion", CPanel({header: "CAccordion", collapsable: true}, CGroup([
            cmember("demo", "demo", CAccordion([
                cmember("Apple", "Apple", CHtml("This is an apple.")),
                cmember("Banana", "Banana", CHtml("This is a banana.")),
                cmember("Orange", "Orange", CHtml("This is an orange.")),
            ])),
            cmember("code", "code", CHtml(<pre>CAccordion([
                cmember("Apple", "Apple", CHtml("This is an apple.")),
                cmember("Banana", "Banana", CHtml("This is a banana.")),
                cmember("Orange", "Orange", CHtml("This is an orange.")),
            ])</pre>)),
        ]))),
        cUnlabelledMember("CEither", CPanel({header: "CEither", collapsable: true}, CGroup([
            cmember("demo", "demo", CEither({}, CHtml("either"), CHtml("or"))),
            cmember("code", "code", CHtml(<pre>CEither(...	)</pre>)),
        ]))),
        cUnlabelledMember("CTable", CPanel({header: "CTable", collapsable: true}, CGroup([
            cmember("demo", "demo", CTable({}, [ccolumn("name", "Name"), ccolumn("age", "Age")], CGroup([cUnlabelledMember("name", CString()), cUnlabelledMember("age", CInteger())]))),
            cmember("code", "code", CHtml(<pre>CTable(...	)</pre>)),
        ]))),
        cUnlabelledMember("CQuantified", CPanel({header: "CQuantified", collapsable: true}, CGroup([
            cmember("demo", "demo", CQuantified(CString())),
            cmember("code", "code", CHtml(<pre>CQuantified(...	)</pre>)),
        ]))),
        cUnlabelledMember("CQuantifiedList", CPanel({header: "CQuantifiedList", collapsable: true}, CGroup([
            cmember("demo", "demo", CQuantifiedList({}, "string", CString())),
            cmember("code", "code", CHtml(<pre>CQuantifiedList(...	)</pre>)),
        ]))),
])),
    cmember("Application-Specific Components", "Application-Specific Components", CGroup([
        cUnlabelledMember("CPhone", CPanel({header: "phone numbers", collapsable: true}, CGroup([
            cUnlabelledMember("doc", CHtml(<p>Phone numbers in the US and Canada have to confirm to a certain syntax.</p>)),
            cmember("demo", "demo", CPhone()),
            cmember("code", "code", CHtml(<pre>CPhone()</pre>)),
        ]))),
 ])),
]);

var workbench = CWorkbench(
	ctx => ctx,
	innerNode => innerNode.render(),
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
