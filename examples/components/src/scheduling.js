var {CGroup, cUnlabelledMember, CSelect, ccase, CNameSpace, CNamed, CTime, CFixedTable, crow} = require("opencpq");

/*
 * Scheduling of repetitive tasks during a week
 */

var days_of_week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var weekdayIndex = {};
days_of_week.forEach((d, i) => weekdayIndex[d] = i);

var weekdaysAfter = i => CSelect([
	for (day of days_of_week)
		onlyIf(weekdayIndex[day] > i, "Days must be selected in order.", [ccase(day)])
]);

function CSchedulingTable(timesPerDay, daysPerWeek) {
	// restrict table size for nonsense input sizes
	if (timesPerDay > 10) timesPerDay = 10;
	if (daysPerWeek > 7) daysPerWeek = 7;
	var tasks = [for (i of range(1, timesPerDay)) `Task ${i}`];
	var row =
		[({lookback: {Day: previousDay}}) =>
		 cUnlabelledMember("Day", CNamed(
			 "lookback", "Day", {valueAccessor: n => n.value},
			 weekdaysAfter(previousDay ? weekdayIndex[previousDay] : -1)
		 ))]
		.concat([
			for (task of tasks)
				({lookback: {[task]: previousDaytask}}) =>
				cUnlabelledMember(task, CNamed(
					"lookback", task, {valueAccessor: n => n.value},
					CTime({defaultValue: previousDaytask})
				))
		]);
	var columns = [{name: "Day", label: "Day"}].concat([for (task of tasks) {name: task, label: task}]);
	var rows = [for (i of range(1, daysPerWeek)) crow(`Row ${i}`, undefined, row)];
	return CNameSpace("lookback", CFixedTable(columns, rows));
}

function range(from, to, step = 1) {
	var result = [];
	for (var i = from; i <= to; i += step) result.push(i);
	return result;
}

function onlyIf(condition, explanation, cases) {
	return condition ? cases : cases.map(c => ({...c, mode: "error", messages: [{level: "error", msg: explanation}]}));
}

module.exports = {CSchedulingTable};