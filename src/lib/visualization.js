var React = require("react");
var {Type} = require("./base");
var {View} = require("./workbench");
var {CSideEffect} = require("./util");

function escapeAttr(v) {
	// `${v}` instead of ("" + v) crashes babel 6.1.2
	return ("" + v).replace('"', '&quot;', "g");
}

class SVGImage {
	constructor(options) {
		this._options = options;
	}
	render() {
		var options = this._options;
		var attributes = (["x", "y", "width", "height"]).reduce(
			(acc, name) => {
				let val = options[name];
				return val === undefined ? acc : `${acc} ${name}="${escapeAttr(val)}"`
			},
			`xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="resources/${escapeAttr(options.url)}"`);
		// The <g/> element is only needed to hold React's
		// "dangerouslySetInnerHTML".  We don't need it for the SVG tree.
		// See https://github.com/facebook/react/issues/2863#issuecomment-75253614
		// for an explanation of the key attribute.
		return <g key={attributes} dangerouslySetInnerHTML={{__html: `<image ${attributes}/>`}}/>;
	}
}

function CImage(spec, type) {
	function addImage(node, ctx) {
		var {visualization} = ctx;
		function processSpec(spec) {
			if (spec == undefined) {
				// do nothing;
			}
			else if (spec instanceof Function)
				processSpec(spec(ctx));
			else if (spec instanceof Array)
				spec.forEach(processSpec);
			else
				visualization.add(new SVGImage(spec));
		}
		processSpec(spec);
	}
	return CSideEffect(addImage, type);
}


class VisualizationContainer {
	constructor(renderWrapper) {
		this._children = [];
		this.render = () => renderWrapper(this._children.map(child => child.render()));
	}
	add(child) {
		this._children.push(child);
	}
}

function CWrapVisualization(renderWrapper, type) {
	return new Type("visualizationWrapper", function makeVisualizationWrapper(ctx) {
		var subVisualization = new VisualizationContainer(renderWrapper);
		ctx.visualization.add(subVisualization);
		return type.makeNode({...ctx, visualization: subVisualization});
	});
}

function CTransform(spec, type) {
	return CWrapVisualization(children => <g transform={spec}>{children}</g>, type);
}

function CSVGRoot({width, height}, type) {
	return CWrapVisualization(children => <svg width={width} height={height}>{children}</svg>, type);
}


class Visualization extends VisualizationContainer {
	constructor() {
		super(
			children => <div style={{width: "100%", display: "inline-flex", flexWrap: "wrap"}}>
				{children}
			</div>
		);
	}
}

function VVisualization({visualization}) {
	return new View("visualization", function renderVisualization() {
		return visualization.render();
	});
}


module.exports = {
	CImage, CTransform, CSVGRoot, CWrapVisualization,
	Visualization, VVisualization,
};
