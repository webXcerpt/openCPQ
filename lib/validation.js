var React = require("react");
var {Type, Node, packed} = require("./base");
var {CUnit} = require("./primitives");
var {CSideEffect} = require("./util");

function CValidate(testFn, type = CUnit()) {
	return new Type("validate", function makeValidate(ctx) {
		return new ValidationNode(testFn, type.makeNode(ctx), ctx);
	});
}

function renderValidation(messages) {
	return <div className="validate">{
		[for ({level, msg, fragment} of messages)
			<div className={`validate-${level}`}><a id={fragment}>{msg}</a></div>
		]
	}</div>;
}

function renderWithValidation(inner, messages) {
	return <div>
		{inner}
		{renderValidation(messages)}
	</div>;
}

class ValidationNode extends Node {
	constructor(testFn, innerNode, ctx) {
		super();
		this._innerNode = innerNode;
		var messages = [];
		var emitter = level => msg => messages.push(ctx.problems.add({level, msg}));
		var callbacks = {
			error:   emitter("error"),
			warning: emitter("warning"),
			info:    emitter("info")
		};
		testFn(this, callbacks, ctx);
		this._messages = messages;
	}
	get inner() {
		return this._innerNode;
	}
	get value() {
		return this.inner.value;
	}
	renderHB() {
		// TODO: Is it always appropriate to attach validation messages to the body?
		var {head, body: innerBody} = this._innerNode.renderHB();
		return {head, body: renderWithValidation(innerBody, this._messages)};
	}
}

function CValidationMessages(messages) {
	return new Type("validationMessages", function makeValidationMessages(ctx) {
		return new ValidationMessagesNode(messages.map(m => ctx.problems.add(m)));
	});
}

class ValidationMessagesNode extends Node {
	constructor(messages) {
		super();
		this._messages = messages;
	}
	renderHB() {
		return {head: renderValidation(this._messages)};
	}
}

module.exports = {CValidate, CValidationMessages, renderWithValidation};
