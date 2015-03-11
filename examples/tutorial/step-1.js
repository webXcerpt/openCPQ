var React = require("react");

var {
	packed,
	CWorkbench,
	CGroup, cmember,
	CSelect, ccase, cdefault,
	CInteger,
    renderTree, rootPath,
} = require("opencpq");

var model = CGroup([
	cmember("material", "Material", CSelect([
		ccase("#123-06", "Pine"),
		cdefault(ccase("#123-08", "Beech")),
		ccase("#123-23", "Maple"),
	])),
	cmember("width", "Width (cm)", CInteger({defaultValue: 90})),
	cmember("height", "Height (cm)", CInteger({defaultValue: 200})),
	cmember("depth", "Depth (cm)", CInteger({defaultValue: 40})),
	cmember("nShelves", "Number of Shelves", CInteger({defaultValue: 5})),
])

var workbench = CWorkbench(
	ctx => ({}),
	innerNode => (
		<div>
			<h1>Configure your book case</h1>
			{packed(innerNode.renderHB())}
		</div>
	),
	model
);

renderTree(
	workbench,
	undefined,
	() => ({
		path: rootPath,
	}),
	document.getElementsByTagName("body")[0]
);
