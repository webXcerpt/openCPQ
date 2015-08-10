var React = require("react");
var {Type, Node} = require("./base");
var {View} = require("./workbench");
var {CSideEffect} = require("./util");
var {ButtonGroup, Button, Glyphicon, Table} = require("react-bootstrap");

var saveAs = require("browser-filesaver");

// TODO Use a CSV lib?
function csvLine(fields) {
	var line = "";
	fields.forEach(field => { 
		if (line.length > 0)
			line += ";"
		line += typeof field === "number" ? field : '"' + field.toString().replace(/"/g, '""') + '"';
	});
	line += "\n";
	return line;
}

class BOMView {
	// TODO Replace itemList with something more generic, e.g., a
	// function mapping the item to extra info (but in what format?).
	constructor(name, itemList, bom) {
		this.name = name;
		var itemMap = {};
		itemList.forEach(entry => itemMap[entry.itemId] = entry);
		this.__itemMap = itemMap;
		this.__bom = bom;
	}
	render() {
		return <div>
		    <ButtonGroup>
				<Button onClick={() => this.exportCSV()}><Glyphicon glyph="th"/> export as CSV</Button>
			</ButtonGroup>
			{this.renderBOM()}
		</div>;
	}
	exportCSV() {
		var csv = [];
		var itemMap = this.__itemMap;
		this.__bom.mapItems(
			(item, quantity) => {
				var entry = itemMap[item];
				var label = entry == undefined ? "" : entry.label;
				var matNo = entry == undefined ? "" : entry.materialNumber;
				csv.push(csvLine([quantity, item, label, matNo])); 
			});
		var blob = new Blob(csv, {type: "text/csv;charset=utf-8"});
		saveAs(blob, "openCPQ.csv");
	}
	renderBOM() {
		var itemMap = this.__itemMap;
		return <Table className="bom">
			<colgroup>
				<col className="bom-col-quantity"/>
				<col className="bom-col-item"/>
				<col className="bom-col-description"/>
				<col className="bom-col-material-number"/>
			</colgroup>
		<thead>
			<tr>
				<th className="bom-quantity-head">#</th>
				<th className="bom-item-head">Item ID</th>
				<th className="bom-description-head">Description</th>
				<th className="bom-material-number-head">Material No.</th>
			</tr>
		</thead>
		<tbody>
			{this.__bom.empty() ?
			 <tr><td colSpan={4}>
				 <div className="validate validate-info">(no entries)</div>
			 </td></tr> :
			 this.__bom.mapItems(
				 (item, quantity) => {
					 var entry = itemMap[item];
					 var label = entry == undefined ? "(missing)" : entry.label;
					 var matNo = entry == undefined ? "(missing)" : entry.materialNumber;
					 return <tr>
						 <td className="bom-quantity">{quantity}</td>
						 <td className="bom-item">{item}</td>
						 <td className="bom-description">{label}</td>
						 <td className="bom-material-number">{matNo}</td>
					 </tr>;
				 }
			 )}
		</tbody></Table>;
	}
}

function VBOM(itemList, {bom}) {
	return new BOMView("bom", itemList, bom);
}

function CBOMEntry(name, quantity, type) {
	return CSideEffect((node, {bom}) => bom.add(name, quantity), type)
}

module.exports = {VBOM, BOMView, CBOMEntry, csvLine};
