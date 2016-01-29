var React = require("react");
var {Type, Node} = require("./base");
var {CGroup, cmember} = require("./group");

function preprocessColumns(rawColumnsSpec, ctx) {
	var columns = [];
	function process(c) {
		if (c == undefined) {
			// do nothing
		}
		else if (c instanceof Array)
			c.forEach(process);
		else if (c instanceof Function)
			process(c(ctx));
		else
			columns.push(c);
	}
	process(rawColumnsSpec);
	return columns;
}

function CFixedTable(columnsSpec, rows) {
	return new Type("fixedTable", function makeFixedTable(ctx) {
		return new FixedTableNode({columns: preprocessColumns(columnsSpec, ctx), rows: CGroup(rows).makeNode(ctx)});
	});
}

// TODO handle the case that the cells in a row are not ordered like the columns and some cells are missing or superfluous
// TODO output a row cell only if there is a matching column

class FixedTableNode extends Node {
	render() {
		var {columns, rows} = this.__options;
		return <table className="fixedTable">
			<colgroup>
				<col className="col-heading" />
				{columns.map(({name}) => <col className={`col-${name}`} />)}
			</colgroup>
			<tbody>
				<tr>
					<th/>
					{columns.map(({label}) => <th>{label}</th>)}
				</tr>
				{rows.mapMembers(({node: row}) => {
					return <tr>
					    <td>{row.label}</td>
						{columns.map(({name}) => {
							var member = row.inner.member(name);
							var field =
								member == undefined ? undefined :
								member.render();
							return <td>{field}</td>
						})}
					</tr>;
				})}
			</tbody>
		</table>;
	}
	get columns() { return this.__options.columns; }
	get rows() { return this.__options.rows; }
}

function crow(name, label, cells) {
	return cmember(name, label, CGroup(cells));
}

module.exports = {CFixedTable, crow};
