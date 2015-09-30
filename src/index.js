require("babel-core/polyfill");

require("./style.css");
require("bootstrap/less/bootstrap.less");
require('react-widgets/lib/less/react-widgets.less');

module.exports = {
	...require("./lib/base"),
	...require("./lib/util"),
	...require("./lib/primitives"),
	...require("./lib/html"),
	...require("./lib/path"),
	...require("./lib/label"),
	...require("./lib/group"),
	...require("./lib/table"),
	...require("./lib/select"),
	...require("./lib/bom"),
	...require("./lib/linear-aggregation"),
	...require("./lib/quantification"),
	...require("./lib/toc"),
	...require("./lib/validation"),
	...require("./lib/problems"),
	...require("./lib/names"),
	...require("./lib/op"),
	...require("./lib/workbench"),
	...require("./lib/root"),
	...require("./lib/embeddedRoot"),
	...require("./lib/visualization"),
	...require("./lib/tabbed-area"),
	...require("./lib/accordion"),
	...require("./lib/panel"),
	...require("./lib/fixed-table"),
};
