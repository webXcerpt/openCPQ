var React = require("react");
var {Type, Node, packed} = require("./base");
var {GroupNode} = require("./group");

function CTable(options, columns) {
	return new TableType(options, columns);
}

class TableType extends Type {
	constructor(options, columns) {
		var _this = this;
		var {defaultValue = []} = options;
		super("table", function makeTable(ctx) {
			var {value = defaultValue, updateTo} = ctx;
			var rows = value.map((element = {}, i) => {
				function updateElement(newElement) {
					var newList = value.slice();
					newList[i] = newElement;
					updateTo(newList);
				}
				return _this.makeRow({
					...ctx,
					value: element,
					updateTo: updateElement,
					rowIndex: i,
					path: ctx.path.ext(i),
				});
			});
			function splice(...args) {
				var newList = value.slice();
				newList.splice.apply(newList, args);
				updateTo(newList);
			}
			return new TableNode({columns, rows, list: value, splice});
		});
		this._columns = columns;
	}
	makeRow(ctx) {
		var {value, updateTo} = ctx;
		return new GroupNode([
			for ({name, type} of this._columns)
				type.makeNode({
					...ctx,
					value: value[name],
					updateTo: newValue => updateTo({...value, [name]: newValue}),
				})
		]);
	}
}

class TableNode extends Node {
	get rows() {
		return this.__options.rows;
	}
	renderHB() {
		// TODO: drag'n'drop
		var {columns, rows, list, splice} = this.__options;
		var body = <table className="table">
			<colgroup>
				<col className="col-buttons"/>
				{[for (col of columns) <col className={`col-${col.name}`} />]}
			</colgroup>
			<tbody>
				<tr>
					<td>
						<button className="dim" onClick={() => splice(0, 0, undefined)}>+</button>
					</td>
					{[for (col of columns) <th>{col.label}</th>]}
				</tr>
				{rows.length === 0 ?
				 <tr>
				 	<td colSpan={columns.length + 1}>
				 		<div className="validate validate-info">(no entries)</div>
					</td>
				 </tr> :
				 rows.map((row, i) => {
					function listOp(name) {
						switch (name) {
						case "insert": splice(i+1, 0, undefined);          break;
						case "copy"  : splice(i+1, 0, list[i]);            break;
						case "delete": splice(i  , 1);                     break;
						case "up"    : splice(i-1, 2, list[i], list[i-1]); break;
						case "down"  : splice(i  , 2, list[i+1], list[i]); break;
						}
					}
					return <tr>
						<td>
						 	<select className="dim" value="noop" onChange={e => listOp(e.target.value)}>
								<option value="noop">&#x2699;</option>
								<option value="insert">insert</option>
								<option value="copy">copy</option>
								<option value="delete">delete</option>
								<option value="up" disabled={i == 0}>up</option>
								<option value="down" disabled={i >= list.length-1}>down</option>
						 	</select>
						</td>
						{row.mapMembers(node => <td>{packed(node.renderHB())}</td>)}
					</tr>;
				 }
				)}
			</tbody>
		</table>;
		return {body};
	}
}

function ccolumn(name, label, type) {
	return {name, label, type};
}

module.exports = {CTable, TableType, ccolumn};
