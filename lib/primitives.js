var React = require("react");

var {Type, Node} = require("./base");

function makeSimpleType(name, nodeClass) {
	return (options = {}) => new Type(name, function makeSimpleNode({value, updateTo}) {
		function retract() {
			updateTo(undefined);
		}
		var userSelected = value !== undefined;
		return new nodeClass({...options, value, updateTo, retract, userSelected});
	});
}

class PrimitiveValueNode extends Node {
	renderHB() {
		return {head: this.renderHead()};
	}
}

class StringNode extends PrimitiveValueNode {
	get text() {
		var {defaultValue = "", value} = this.__options;
		if (value == undefined || value === "")
			value = defaultValue;
		return value;
	}
	get value() {
		return this.text;
	}
	renderHead() {
		var {value, updateTo, defaultValue = "", className, userSelected, retract} = this.__options;
		return <span>
			<input
				className={className}
				type="text"
				value={value}
				placeholder={defaultValue}
				onChange={e => updateTo(e.target.value)}
			/>
			{userSelected ? <button onClick={retract}>&lt;</button> : undefined}
		</span>;
	}
}
var CString = makeSimpleType("string", StringNode);

// This is actually for unsigned integers.  TODO: Rename?
class IntegerNode extends StringNode {
	constructor(options) {
		var {defaultValue, value} = options;
		if (typeof defaultValue == "number")
			options = {...options, defaultValue: defaultValue.toFixed()};
		if (value != undefined && typeof value != "string")
			options = {...options, value: `${value}`};
		super(options);
	}
	get value() {
		return parseInt(this.text);
	}
	renderHead() {
		return <div>
			{super.renderHead()}
			{/[^0-9]/.test(this.text) ?
			 // TODO Error message should also go to the problems view.
			 <div className="validate validate-error">Input contains non-digits.</div> :
			 undefined
			 }
		</div>;
	}
}
var CInteger = makeSimpleType("integer", IntegerNode);

class DateNode extends StringNode {
	constructor(options) {
		var {defaultValue, value} = options;
		if (defaultValue instanceof Date)
			options = {...options, defaultValue: defaultValue.toDateString()};
		super(options);
	}
	get value() {
		return new Date(this.text);
	}
	renderHead() {
		return <div>
			{super.renderHead()}
			{isNaN(Date.parse(this.text)) ? // TODO recognition of date formats should be improved
			 // TODO Error message should also go to the problems view.
			 <div className="validate validate-error">Input is not a valid date.</div> :
			 undefined
			 }
		</div>;
	}
}
var CDate = makeSimpleType("date", DateNode);

class BooleanNode extends PrimitiveValueNode {
	get value() {
		var {defaultValue = false, value = defaultValue} = this.__options;
		return value;
	}
	renderHead() {
		var {userSelected, retract, disabled = false, updateTo} = this.__options;
		return <span>
			<input
				type="checkbox"
				checked={this.value}
				onChange={e => updateTo(e.target.checked)}
				disabled={disabled}
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
    CString, CInteger, CDate, CBoolean, CUnit
}
