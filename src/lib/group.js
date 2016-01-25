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
		super();
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
	get members() { return this._members; }
	render() {
		return <div className="group">
			{this.mapMembers(({node}) => node == undefined ? undefined : node.render())}
		</div>;
	}
}

module.exports = {CGroup, cmember, cUnlabelledMember, GroupNode, preprocessMembers};
