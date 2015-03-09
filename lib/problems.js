var React = require("react");
var {Type, Node, packed} = require("./base");
var {View} = require("./workbench");

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
		// TODO: Add <col> elements
		return <table className="problems"><tbody>
			<tr>
				<th className="problems-level-head">Level</th>
				<th className="problems-msg-head">Message</th>
			</tr>
			{
				this.empty() ?
				<tr><td colSpan={2}>
					<div className="validate validate-info">(no entries)</div>
				</td></tr> :
				[
					for ({level, msg, fragment} of this._problemList) <tr>
						<td className="problems-level">{level}</td>
						<td className="problems-msg"><a href={"#" + fragment}>{msg}</a></td>
					</tr>
				]
			}
		</tbody></table>;
	}
}

function VProblems({problems}) {
	return new View("problems", function renderProblems() {
		return problems.render();
	});
}

module.exports = {VProblems, Problems};
