var React = require("react");
var {Input, Button} = require("react-bootstrap");
var DateTimePicker = require('react-widgets/lib/DateTimePicker');
var {confirmOrRetractButton} = require("./confirm-retract");

var {Type, Node} = require("./base");
var {confirmOrRetractButton} = require("./confirm-retract");
var {HBox} = require("./display");

function makeSimpleType(name, nodeClass) {
	return (options = {}) => new Type(name, function makeSimpleNode({value, updateTo}) {
		function retract() {
			updateTo(undefined);
		}
		var userSelected = value !== undefined;
		return new nodeClass({...options, value, updateTo, retract, userSelected});
	});
}

class PrimitiveValueNode extends Node {}

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
	render() {
		var {value, updateTo, defaultValue = "", className, userSelected, retract} = this.__options;
		return <Input
			className={className}
			type="text"
			value={value}
			placeholder={defaultValue}
			onChange={e => updateTo(e.target.value)}
			buttonAfter={confirmOrRetractButton(userSelected, () => updateTo(defaultValue), retract)}
		/>
	}
}
var CString = makeSimpleType("string", StringNode);

class TextareaNode extends StringNode {
	render() {
		var {value, updateTo, defaultValue = "", className, userSelected, retract} = this.__options;
		return <Input
			className={className}
			type="textarea"
			value={value}
			placeholder={defaultValue}
			onChange={e => updateTo(e.target.value)}
			buttonAfter={confirmOrRetractButton(userSelected, () => updateTo(defaultValue), retract)}
		/>
	}
}
var CTextarea = makeSimpleType("textarea", TextareaNode);

// This is actually for unsigned integers.  TODO: Rename?
class IntegerNode extends StringNode {
	constructor(options) {
		var {className, defaultValue, value} = options;
		options = {...options};
		options.className = className ? `${className} integer` : "integer";
		if (typeof defaultValue == "number")
			options.defaultValue = defaultValue.toFixed();
		if (value != undefined && typeof value != "string")
			options.value = `${value}`;
		super(options);
	}
	get value() {
		return parseInt(this.text);
	}
	render() {
		return <div>
			{super.render()}
			{/[^0-9]/.test(this.text) ?
			 // TODO Error message should also go to the problems view.
			 <div className="validate validate-error">Input contains non-digits.</div> :
			 undefined
			 }
		</div>;
	}
}
var CInteger = makeSimpleType("integer", IntegerNode);

class DateNode extends PrimitiveValueNode {
	get value() {
		var {defaultValue, value} = this.__options;
		return value || (typeof defaultValue === 'string' ? new Date(defaultValue) : defaultValue);
	}
	render() {
		var {defaultValue, value, updateTo, format, parse} = this.__options;
		// TODO make user-defined parameterization more generic
		return <HBox>
			<DateTimePicker
				time={false}
				format={format || "MMM dd yyyy"}
				parse={parse || ["MMM d y", "MMM d", "M d y", "M d", "y-M-d", "M/d/y", "M/d"]}
				value={this.value || null}
				onChange={updateTo}
			/>
			{
				(value || defaultValue) && // Don't display if there is neither a value nor a default value
				confirmOrRetractButton(value != undefined, () => updateTo(this.value), () => updateTo(undefined))
			}
		</HBox>;
	}
}
var CDate = makeSimpleType("date", DateNode);

// FIXME: defaultValue handling
class TimeNode extends PrimitiveValueNode {
	get value() {
		var {defaultValue, value} = this.__options;
		return value || (typeof defaultValue === 'string' ? new Date(defaultValue) : defaultValue);
	}
	render() {
		var {defaultValue, value, updateTo, format, parse} = this.__options;
		// TODO make user-defined parameterization more generic
		return <HBox>
			<DateTimePicker
				calendar={false}
				format={format || "h:mm tt"}
				parse={parse || ["h:mm tt"]}
				value={this.value || null}
				onChange={updateTo}
			/>
			{
				(value || defaultValue) && // Don't display if there is neither a value nor a default value
				confirmOrRetractButton(value != undefined, () => updateTo(this.value), () => updateTo(undefined))
			}
		</HBox>;
	}
}
var CTime = makeSimpleType("date", TimeNode);

class BooleanNode extends PrimitiveValueNode {
	get value() {
		var {defaultValue = false, value = defaultValue} = this.__options;
		return value;
	}
	render() {
		var {userSelected, retract, disabled = false, updateTo} = this.__options;
		return <span>
			<input
				type="checkbox"
				checked={this.value}
				onChange={e => updateTo(e.target.checked)}
				disabled={disabled}
			/>
			{confirmOrRetractButton(userSelected, () => updateTo(this.value), retract, "xsmall")}
		</span>;
	}
	renderResult(){
		return <span>{
			this.value ? this.__options.yes || "yes" : this.__options.no || "no"
		}</span>;
	}
}
var CBoolean = makeSimpleType("boolean", BooleanNode);

class UnitNode extends Node {
	render() {
		return undefined;
	}
}
var CUnit = makeSimpleType("unit", UnitNode);

module.exports = {
    CString, CTextarea, CInteger, CDate, CTime, CBoolean, CUnit
}
