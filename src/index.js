import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import Immutable from "immutable";

import {CGroup, CSelect, CPrimitive} from "./opencpq.js"
import renderer from "./renderers/ugly-renderer.js";

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

class Configurator extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      config: Immutable.fromJS({color: {$choice: "blue"}})
    }
  }
  render() {
    const setConfig = config => this.setState({config});

    return (
      <div>
        {
          tShirt({
            value: this.state.config,
            updateTo(newValue) {
              setConfig(newValue);
            }
          })
          .accept(renderer)
        }
        <pre>
          {JSON.stringify(this.state.config, null, 2)}
        </pre>
      </div>
    );
  }
}

ReactDOM.render(<Configurator/>, document.getElementById("mnt"));
