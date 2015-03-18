var React = require("react");
var {Type, Node} = require("./base");
var {CLabeled} = require("./label");

function cmember(name, label, type) {
	return {name, type: CLabeled(label, type)};
}

function cUnlabelledMember(name, type) {
	return {name, type};
}

function makeMemberNode({name, type}, ctx) {
	var {path, value = {}, updateTo} = ctx;
	return {name, node: type.makeNode({
		...ctx,
		path: path.ext(name),
		value: value[name],
		updateTo: newValue => updateTo({...value, [name]: newValue})
	})};
}

function preprocessMembers(rawMemberDecls, ctx) {
	var members = [];
	function process(m) {
		if (m == undefined) {
			// do nothing
		}
		else if (m instanceof Array)
			m.forEach(process);
		else if (m instanceof Function)
			process(m(ctx));
		else
			members.push(makeMemberNode(m, ctx));
	}
	process(rawMemberDecls);
	return members;
}

function CGroup(rawMemberDecls) {
	return new Type("group", function makeGroup(ctx) {
		return new GroupNode(preprocessMembers(rawMemberDecls, ctx));
	});
}

class GroupNode extends Node {
	constructor(members) {
		this._members = members;
		var indexedMembers = {};
		members.forEach(m => indexedMembers[m.name] = m.node);
		this._indexedMembers = indexedMembers;
	}
	mapMembers(fn) {
		return this._members.map(fn);
	}
	member(name) {
		return this._indexedMembers[name];
	}
	renderHB() {
		var body = <div className="group">
			{this.mapMembers(({node}) => {
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
