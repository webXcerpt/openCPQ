var React = require("react");
var {Button, DropdownButton, MenuItem} = require("react-bootstrap");
var {Type, Node} = require("./base");
var {CGroup} = require("./group");

function CTable(options, columnLabels, rowType) {
	return new TableType(options, columnLabels, rowType);
}

class TableType extends Type {
	constructor(options, columnLabels, rowType) {
		var {defaultValue = []} = options;
		super("table", function makeTable(ctx) {
			var {value = defaultValue, updateTo} = ctx;
			var rows = value.map((element = {}, i) => {
				function updateElement(newElement) {
					var newList = value.slice();
					newList[i] = newElement;
					updateTo(newList);
				}
				return rowType.makeNode({
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
			return new TableNode({columnLabels, rows, list: value, splice});
		});
	}
}

class TableNode extends Node {
	get rows() {
		return this.__options.rows;
	}
	render() {
		// TODO: drag'n'drop
		var {columnLabels, rows, list, splice} = this.__options;
		return <table className="table">
			<colgroup>
				<col className="col-buttons"/>
				{[for ({name} of columnLabels) <col className={`col-${name}`} />]}
			</colgroup>
			<tbody>
				<tr>
					<td>
						<Button className="dim" onClick={() => splice(0, 0, undefined)}>+</Button>
					</td>
					{[for ({label} of columnLabels) <th>{label}</th>]}
				</tr>
				{rows.length === 0 ?
				 <tr>
				 	<td colSpan={columnLabels.length + 1}>
				 		<div className="validate validate-info">(no entries)</div>
					</td>
				 </tr> :
				 rows.map((row, i) => {
					return <tr>
						<td>
							<DropdownButton title="" className="dim list-ops-button">
								<MenuItem onSelect={() => splice(i+1, 0, undefined)}>insert</MenuItem>
								<MenuItem onSelect={() => splice(i+1, 0, list[i])}>copy</MenuItem>
								<MenuItem onSelect={() => splice(i  , 1)}>delete</MenuItem>
								{i > 0 && <MenuItem onSelect={() => splice(i-1, 2, list[i], list[i-1])}>up</MenuItem>}
								{i < list.length - 1 && <MenuItem onSelect={() => splice(i  , 2, list[i+1], list[i])}>down</MenuItem>}
							</DropdownButton>
						</td>
						{columnLabels.map(({name}) => {
							var member = row.member(name);
							var field = member == undefined ? undefined : member.render();
							return <td>{field}</td>;
						})}
					</tr>;
				 }
				)}
			</tbody>
		</table>;
	}
}

function ccolumn(name, label) {
	return {name, label};
}

module.exports = {CTable, TableType, ccolumn};
