var React = require("react");
var {Type, Node, CGroup, cmember, cUnlabelledMember, LabeledNode} = require("opencpq");

function CFixedTable(columnsSpec, rows) {
	return new Type("fixedTable", function makeFixedTable(ctx) {
		var columns = columnsSpec instanceof Function ? columnsSpec(ctx) : columnsSpec;
		return new FixedTableNode({columns, rows: CGroup(rows).makeNode(ctx)});
	});
}

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
							if (row instanceof LabeledNode)
								var member = row.inner.member(name);
							else
								var member = row.member(name);
							var field = member == undefined ? undefined : member.render();
							return <td>{field}</td>
						})}
					</tr>;
				})}
			</tbody>
		</table>;
	}
}

function crow(name, label, cells) {
	return label == undefined
		? cUnlabelledMember(name, CGroup(cells))
		: cmember(name, label, CGroup(cells));
}

module.exports = {CFixedTable, crow};
