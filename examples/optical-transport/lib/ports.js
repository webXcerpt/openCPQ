var {
	SimpleAdder, CLinearAggregation,
	CSideEffect,
	CValidate,
	CQuantifiedList,
} = require("opencpq");

function CPorts(max, type) {
	return CLinearAggregation("portCount", SimpleAdder, CValidate(
		function maxPorts(node, {error, warning, info}, {portCount}) {
			var sum = portCount.get();
			if (isNaN(sum))
				error("Cannot compute number of used ports.");
			else if (sum === 0)
				warning(`${max} ports to be configured.`);
			else if (sum < max)
				warning(`Only ${sum} of ${max} ports configured.`);
			else if (sum == max)
				info(`All ${max} ports used.`);
			else // sum > max
				error(`${sum} transceivers configured for only ${max} ports.`);
		},
		CQuantifiedList({}, "Transceiver", CSideEffect((node, {portCount}) => {portCount.add()}, type))
	));
}

module.exports = {CPorts};
