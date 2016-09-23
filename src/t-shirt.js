import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import Immutable from "immutable";

import {CGroup, CSelect, CList, CPrimitive} from "./opencpq.js"
import render from "./renderers/ugly-renderer.js";
import modeColors from "./renderers/mode-colors.js";


/*
const tShirt = config`[
- size: Size (
  | XS
  | S
  |*M
  | L
  | XL
  | XXL
  | custom: Custom [
    - length: Length ${CPrimitive(...)}
    - waist: Waist ${CPrimitive(...)}
    - armLength: Arm Length ${CPrimitive(...)}
    ]
  )
- color: Color ${CSelect(...)}
- ...
]`;
*/

export function cref(ctx, name) {
  let found = false;
  let value = undefined;
  for (let node = ctx.node; !found && node; node = node.parent) {
    node.accept({
      visitGroup(node) {
        if (node.hasMember(name)) {
          found = true;
          value = node.member(name).node;
        }
      }
    });
  }
  return value;
}

const tShirt = CGroup([
  {tag: "size", props: {label: "Size"}, detail: CSelect([
    {tag: "XXS"},
    {tag: "XS"},
    {tag: "S"},
    {tag: "M", mode: "default"},
    {tag: "L"},
    {tag: "XL"},
    {tag: "XXL"},
    {tag: "custom", props: {label: "Custom"}, detail: CGroup([
      {tag: "length", props: {label: "Length (cm)"}, detail: CPrimitive()},
      {tag: "waist", props: {label: "Waist (cm)"}, detail: CPrimitive()},
      {tag: "armLength", props: {label: "Arm Length (cm)"}, detail: CPrimitive()},
    ])},
  ])},
  {
    tag: "color",
    props: {label: "Color"},
    detail: CSelect(
      {props: {render: renderAsRadioButtons}},
      ["red", "green", "blue"].map(tag => ({
        tag,
        mode: ctx => {
          const textColorNode = cref(ctx, "textColor");
          return textColorNode && textColorNode.choice === tag ? "error" : "normal";
        }
      }))
    )
  },
  {tag: "text", props: {label: "Print Text"}, detail: CPrimitive()},
  ctx => cref(ctx, "text").value && [
    {
      tag: "textColor",
      props: {label: "Text Color"},
      detail: CSelect(
        {props: {render: renderAsRadioButtons}},
        ["red", "green", "blue"].map(tag =>
          ({tag, mode: ctx => cref(ctx, "color").choice === tag ? "error" : "normal"})
        )
      )
    },
    {tag: "textSize", props: {label: "Text Size"}, detail: CSelect([
      {tag: "5cm"},
      {tag: "10cm"},
      {tag: "15cm"},
    ])}
  ],
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
      config: Immutable.fromJS([{color: {$choice: "blue"}}])
    }
  }
  render() {
    return (
      <div>
        {render(
          CList(tShirt)({
            id: "$t-shirt",
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

ReactDOM.render(<Configurator/>, document.getElementById("t-shirt"));
