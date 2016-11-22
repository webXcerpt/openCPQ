import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import Immutable from "immutable";

import {CGroup, CSelect, CList, CPrimitive} from "./opencpq.js"
import render from "./renderers/ugly-renderer.js";
import modeColors from "./renderers/mode-colors.js";

const colors = [
  {name: "white", color: "#ffffff"},
  {name: "black", color: "#000000"},
  {name: "grey" , color: "#808080"},
  {name: "green", color: "#00ff00"},
];

const colorMenu = CSelect(
  colors.map(({name, color}) => ({tag: name, props: {color}}))
);

const door = CGroup([
  {tag: "color", props: {label: "Color"}, detail: colorMenu}
]);

const levelDoor = (side, tag, label) => ({node}) =>
  // `node` (the containing group node) must already contain member `config`.
  // Could we be more lazy here?  (Not needed for this configurator, but might
  // be helpful in other configurators.)
  node.member("config").node.choice.includes(side) &&
  {tag, props: {label}, detail: door};

const level = CGroup([
  {tag: "name", props: {label: "Level Name"}, detail: CPrimitive()},
  // In the aritco configurator heights are given incrementally.  And for each
  // floor (even the last one!) the increment ("travel height") is given as
  // ceiling height plus ceiling thickness.
  {tag: "height", props: {label: "Height Above Reference Level (mm)"}, detail: CPrimitive()},
  // ### walls:
  //   side A: glass panel/sheet panel
  //   side B: glass panel/sheet panel
  //   side C: glass panel/sheet panel
  //   (The ARITCO configurator asks this even for the door side(s).)
  {tag: "doors", props: {label: "Doors"}, detail: CGroup([
    {tag: "config", props: {label: "Configuration"}, detail: CSelect([
      {tag: "F"  , props: {label: "front"}},
      {tag: "L"  , props: {label: "left" }},
      {tag: "R"  , props: {label: "right"}},
      {tag: "FL" , props: {label: "front + left" }},
      {tag: "FR" , props: {label: "front + right"}},
      {tag: "LR" , props: {label: "left + right" }},
      {tag: "FLR", props: {label: "front + left + right"}},
    ])},
    levelDoor("F", "front", "Front Door"),
    levelDoor("L", "left" , "Left Door" ),
    levelDoor("R", "right", "Right Door"),
  ])}
]);

const lift = CGroup([
  // construction:
  //   number of floors: 2/3/4/5/6
  //   floor numbering starts at: -1/0/1 (or any integer?)
  //   ceiling: boolean
  //   back covering: boolean
  // size: 1100x1400/1000x1200/1100x830/1000x830/600x830
  // colors:
  //   wall color: colorMenu
  //   door color: colorMenu
  // glass:
  //   glass walls: yes/no
  //     glass finish: clear/tinted
  //     glass height: standard/high
  // interior:
  //   floor: carpet/vinyl (actually multiple carpet colors and vinyl designs)
  //   wall design: (9 different designs)
  // light:
  //   personalized light: yes/no
  //      color: rainbow slider
  //      saturation: slider (saturation based on the selected color)
  //
  {tag: "levels", props: {label: "Levels"}, detail: CList(level)},
]);

function renderAsRadioButtons({id, choices, choice, fullChoice: {resolvedMode}, choose}) {
  return (
    <div>
      {choices.map(({tag, resolvedMode, props: {label = tag} = {}}) => {
        const inputId = `${id}:${tag}`;
        return (
          <div key={tag}>
            <input
              type="radio"
              id={inputId}
              name={id}
              checked={tag === choice}
              onChange={() => choose(tag)}
            />
            <label
              htmlFor={inputId}
              style={{color: modeColors[resolvedMode]}}
            >
              {label}{" "}[{resolvedMode}]
            </label>
          </div>
        );
      }
      )}
    </div>
  );
}

class Configurator extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      config: Immutable.fromJS({levels: [
        {name: "Ground Floor", height: "0"},
        {name: "First Floor", height: "2800"}
      ]})
    }
  }
  render() {
    return (
      <div>
        {render(
          lift({
            id: "$lift",
            value: this.state.config,
            updateTo: config => this.setState({config})
          })
        )}
        <pre>
          {JSON.stringify(this.state.config, null, 2)}
        </pre>
      </div>
    );
  }
}

ReactDOM.render(<Configurator/>, document.getElementById("lift"));
