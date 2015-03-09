var React = require("react");

var {Type, Node} = require("./base");

function makeSimpleType(name, nodeClass) {
	return options => new Type(name, function makeSimpleNode(value, updateTo, ctx) {
		function retract() {
			updateTo(undefined);
		}
		var userSelected = value !== undefined;
		return new nodeClass({...options, retract, userSelected}, value, updateTo);
	});
}

class PrimitiveValueNode extends Node {
	constructor(options, value, updateTo) {
		super(options);
		this.__value = value;
		this.__updateTo = updateTo;
	}
	renderHB() {
		return {head: this.renderHead()};
	}
}

class StringNode extends PrimitiveValueNode {
	constructor(options, value, updateTo) {
		var {defaultValue} = options;
		if (defaultValue === undefined)
			options = {...options, defaultValue: ""};
		super(options, value, updateTo);
	}
	get text() {
		var result = this.__value;
		if (result == undefined || result === "")
			result = this.__options.defaultValue;
		return result;
	}
	get value() {
		return this.text;
	}
	renderHead() {
		var {defaultValue, className, userSelected, retract} = this.__options;
		return <span>
			<input
				className={className}
				type="text"
				value={this.__value}
				placeholder={defaultValue === "" ? "" : `default: ${defaultValue}`}
				onChange={e => this.__updateTo(e.target.value)}
			/>
			{userSelected ? <button onClick={retract}>&lt;</button> : undefined}
		</span>;
	}
}
var CString = makeSimpleType("string", StringNode);

// This is actually for unsigned integers.  TODO: Rename?
class IntegerNode extends StringNode {
	constructor(options, value, updateTo) {
		var {defaultValue} = options;
		if (typeof defaultValue == "number")
			options = {...options, defaultValue: defaultValue.toFixed()};
		if (value != undefined && typeof value != "string")
			value = `${value}`;
		super(options, value, updateTo);
	}
	get value() {
		var {text} = this;
		return text == undefined ? undefined : parseInt(text);
	}
	renderHead() {
		return <div>
			{super.renderHead()}
			{/[^0-9]/.test(this.text) ?
			 <div className="validate validate-error">Input contains non-digits.</div> :
			 undefined
			 }
		</div>;
	}
}
var CInteger = makeSimpleType("integer", IntegerNode);

class BooleanNode extends PrimitiveValueNode {
	constructor(options = {}, value, updateTo) {
		if (options.defaultValue === undefined)
			options = {...options, defaultValue: false};
		if (options.disabled === undefined)
			options = {...options, disabled: false};
		super(options, value, updateTo);
	}
	get value() {
		var result = this.__value;
		if (result == undefined || result === "")
			result = this.__options.defaultValue;
		return result;
	}
	renderHead() {
		var {userSelected, retract} = this.__options;
		return <span>
			<input
				type="checkbox"
				checked={this.value}
				onChange={e => this.__updateTo(e.target.checked)}
				disabled={this.__options.disabled}
			/>
			{userSelected ? <button onClick={retract}>&lt;</button> : undefined}
		</span>;
	}
}
var CBoolean = makeSimpleType("boolean", BooleanNode);

class UnitNode extends Node {
	renderHB() {
		return {};
	}
}
var CUnit = makeSimpleType("unit", UnitNode);

module.exports = {
    CString, CInteger, CBoolean, CUnit
}
