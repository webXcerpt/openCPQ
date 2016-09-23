import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import Immutable from "immutable";

import {CGroup, CSelect, CList, CPrimitive} from "./opencpq.js"
import render from "./renderers/ugly-renderer.js";
import modeColors from "./renderers/mode-colors.js";

const door = CGroup([
  {tag: "color", props: {label: "Color"}, detail: CSelect([
    {tag: "white", props: {color: "#ffffff"}},
    {tag: "black", props: {color: "#000000"}},
    {tag: "grey" , props: {color: "#808080"}},
    {tag: "green", props: {color: "#00ff00"}},
  ])}
]);

const levelDoor = (side, tag, label) => ({node}) =>
  // `node` (the containing group node) must already contain member `config`.
  // Could we be more lazy here?  (Not needed for this configurator, but might
  // be helpful in other configurators.)
  node.member("config").node.choice.includes(side) &&
  {tag, props: {label}, detail: door};

const level = CGroup([
  {tag: "name", props: {label: "Level Name"}, detail: CPrimitive()},
  {tag: "height", props: {label: "Height Above Reference Level (mm)"}, detail: CPrimitive()},
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
