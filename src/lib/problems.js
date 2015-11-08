var React = require("react");
var {Table, Glyphicon} = require("react-bootstrap");
var {Type, Node} = require("./base");
var {View} = require("./workbench");

var glyphmap = {
	error: "ban-circle",
	warning: "warning-sign",
}

class Problems {
	constructor() {
		this._problemList = [];
	}
	add(problem) {
		problem = {...problem, fragment: `problem_${this._problemList.length}`};
		this._problemList.push(problem);
		return problem;
	}
	empty() {
		return this._problemList.length == 0;
	}
	mapProblems(fn) {
		return this._problemList.map(fn);
	}
	render() {
		var rows = this._problemList
			.filter(({level}) => level !== "info")
			.map(
				({level, msg, fragment}) =>
					<tr>
						<td className={`problem-msg problem-${level}`}>
							<Glyphicon glyph={glyphmap[level]}/>
							{" "}
							<a href={"#" + fragment}>{msg}</a>
						</td>
					</tr>
			);
		// TODO: Add <col> elements
		return <Table className="problems"><tbody>
			{
				rows.length === 0 ?
				<tr><td>
					<div className="validate validate-info">(no entries)</div>
				</td></tr> :
				{rows}
			}
		</tbody></Table>;
	}
}

function VProblems({problems}) {
	return new View("problems", function renderProblems() {
		return problems.render();
	});
}

module.exports = {VProblems, Problems};
