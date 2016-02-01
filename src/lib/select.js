var React = require("react");
var {ButtonGroup, Button, DropdownButton, MenuItem} = require("react-bootstrap");
var {HBox} = require("./display");
var {Type, Node} = require("./base");
var {CValidate, renderWithValidation} = require("./validation");
var {CUnit} = require("./primitives");
var {confirmOrRetractButton} = require("./confirm-retract");

function ccase(name, label = name, type = CUnit()) {
	return {name, label, type, mode: "plain", isDefault: false};
}

function cdefault(case_) {
	return {...case_, isDefault: true};
}

// For the value:
function csel($case, $detail) {
	return {$case, $detail};
}

function processCases(ctx, rawCases) {
	var result = [];
	function process(c) {
		if (c == undefined) {
			// do nothing
		}
		else if (c instanceof Array)
			c.forEach(process);
		else if (c instanceof Function)
			process(c(ctx));
		else
			result.push(c);
	}
	process(rawCases);
	return result;
}

var modes = ["plain", "warning", "error", "hidden"];
function modeIdx(mode) { return modes.indexOf(mode); }

function findCaseWithBestMode(cases) {
	var i = modes.length;
	var bestCase = undefined;
	cases.forEach(case_ => {
		var caseModeIdx = modeIdx(case_.mode);
		if (caseModeIdx < i) {
			i = caseModeIdx;
			bestCase = case_
		}
	});
	return bestCase;
}

/**
 * For the basic usage of CSelect simply pass an array of cases as
 * created by ccase(...).  However, to provide some flexibility the
 * parameter of CSelect is processed as follows:
 * - For an array, process all its elements recursively.
 * - For a function, apply the function to the context and
 *   process the return value recursively.
 * - An undefined value is simply ignored.
 * - Otherwise the value is expected to be a case description (as
 *   returned by ccase(...)) and used as a menu entry.
 * This way for example a sub-range of menu entries can be made
 * dependent on the run-time context.
 */
function CSelect(rawCases) {
	return new Type("select", function makeSelect(ctx) {
		var {value, updateTo, problems} = ctx;
		var cases = processCases(ctx, rawCases);
		var defaultCase =
			cases.find(x => x.isDefault) ||
			findCaseWithBestMode(cases) ||
			cases[0];
		var userSelected = value != undefined
		if (!userSelected)
			value = csel(defaultCase.name);
		function retract() {
			updateTo(undefined);
		}
		var {$case: caseName, $detail: detail} = value;
		function getCase(name) {
			return cases.find(x => x.name === name);
		}
		function updateCase(newCaseName) {
			updateTo(csel(newCaseName));
		}
		function updateDetail(newDetail) {
			updateTo(csel(caseName, newDetail));
		}
		var currentCase = getCase(caseName);
		if (currentCase == undefined)
			currentCase = {
				name: caseName,
				label: `unknown option: ${caseName}`,
				type: CUnit(),
				mode: "error"
			};
		var {mode, messages = []} = currentCase;
		messages = messages.map(m => problems.add(m));
		var detailNode = currentCase.type.makeNode({...ctx, value: detail, updateTo: updateDetail});
		return new SelectNode({cases, caseName, currentCase, userSelected, retract, mode, messages, detailNode, updateCase});
	});
}

class SelectNode extends Node {
	get caseName() {
		return this.__options.caseName;
	}
	get value() {
		return this.caseName;
	}
	get label() {
		return this.__options.currentCase.label;
	}
	get currentCase() { return this.__options.currentCase; }
	get detail() { return  this.__options.detailNode; }
	render() {
		var {cases, caseName, currentCase, userSelected, retract, mode, messages, detailNode, updateCase} = this.__options;
		var menu = renderWithValidation(
			<ButtonGroup>
				<DropdownButton title={currentCase.label} className={`select-select select-mode-${mode}`}>
					{cases.map(
						({name, label, mode}) =>
							<MenuItem className={`select-option option-mode-${mode}`} eventKey={name} onSelect={updateCase}>{label}</MenuItem>
					)}
				</DropdownButton>
				{confirmOrRetractButton(userSelected, () => updateCase(currentCase.name), retract)}
			</ButtonGroup>,
			messages
		);
		var detail = detailNode.render();
		return <div>
			{menu}
			{detail == undefined ? undefined : <div className="select-detail">{detail}</div>}
		</div>;
	}
}

// Coding and using "unanswered" could be shown in a modelling demo.
function unansweredCase(label) {
	return cdefault(ccase("unanswered", label, CValidate(
		(node, {warning}) => warning("No value selected.")
	)));
}


function CEither(rawOptions = {}, thenType, elseType) {
	return new Type("either", function makeEither(ctx) {
		var {value = {}, updateTo} = ctx;
		// TODO Support validation of the choice.
		var options = {...rawOptions};
		if (options.defaultValue === undefined)
			options.defaultValue = false;
		if (options.disabled == undefined)
			options.disabled = false;
		var {$case: choice, $detail: detail} = value;
		var userSelected = choice !== undefined;
		if (!userSelected)
			choice = options.defaultValue;
		var detailType = choice ? thenType : elseType;
		if (detailType == undefined)
			detailType = CUnit();
		function retract() {
			updateTo(undefined);
		}
		function updateChoice(newChoice) {
			updateTo(csel(newChoice));
		}
		function updateDetail(newDetail) {
			updateTo(csel(choice, newDetail));
		}
		var detailNode = detailType.makeNode({...ctx, value: detail, updateTo: updateDetail});
		return new EitherNode({...options, userSelected, retract, choice, detailNode, updateChoice});
	});
}

class EitherNode extends Node {
	get choice() { return this.__options.choice; }
	get value() { return this.choice; }
	get detail() { return  this.__options.detailNode; }
	render() {
		var {disabled, userSelected, retract, choice, detailNode, updateChoice} = this.__options;
		var choice = <span>
			<input
				type="checkbox"
				checked={choice}
				onChange={e => updateChoice(e.target.checked)}
				disabled={disabled}
			/>
			{confirmOrRetractButton(userSelected, () => updateChoice(this.__options.choice), retract, "xsmall")}
		</span>;
		var detail = detailNode.render();
		return <div>
			{choice}
			{detail}
		</div>;
	}
}


module.exports = {
	CSelect, SelectNode, ccase, cdefault, unansweredCase, csel,
	CEither, EitherNode,
};
