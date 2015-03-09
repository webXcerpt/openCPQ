var React = require("react");
var {Type, Node} = require("./base");
var {CLabeled} = require("./label");

function cmember(name, label, type) {
	return {name, type: CLabeled(label, type)};
}

function cUnlabelledMember(name, type) {
	return {name, type};
}

function CGroup(rawMemberDecls) {
	return new Type("group", function makeGroup(ctx) {
		var {path, value = {}, updateTo} = ctx;
		var members = [];
		function process(m) {
			if (m == undefined) {
				// do nothing
			}
			else if (m instanceof Array)
				m.forEach(process);
			else if (m instanceof Function)
				process(m(ctx));
			else {
				var {name, type} = m;
				members.push(type.makeNode({
					...ctx,
					path: path.ext(name),
					value: value[name],
					updateTo: newValue => updateTo({...value, [name]: newValue})
				}));
			}
		}
		process(rawMemberDecls);
		return new GroupNode(members);
	});
}

class GroupNode extends Node {
	constructor(members) {
		this._members = members;
	}
	mapMembers(fn) {
		return this._members.map(fn);
	}
	renderHB() {
		var body = <div className="group">
			{this.mapMembers(node => {
				var {head, body} = node.renderHB();
				return [
					head == undefined ? undefined :
						<div className="member-head">{head}</div>,
					body == undefined ? undefined :
						<div className="member-body">{body}</div>
				];
			 })}
		</div>;
		return {body};
	}
}

module.exports = {CGroup, cmember, cUnlabelledMember, GroupNode};
