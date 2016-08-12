import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import {CGroup, CSelect, CText, CNumeric, cref} from "./opencpq.js"

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
    - length: Length ${new Numeric()}
    - waist: Waist ${new Numeric()}
    - armLength: Arm Length ${new Numeric()}
    ]
  )
- color: Color ${CSelect(...)}
- ...
]`;
*/

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
      {tag: "length", props: {label: "Length (cm)"}, detail: CNumeric()},
      {tag: "waist", props: {label: "Waist (cm)"}, detail: CNumeric()},
      {tag: "armLength", props: {label: "Arm Length (cm)"}, detail: CNumeric()},
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
  {tag: "text", props: {label: "Print Text"}, detail: CText()},
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

const modeColors = {
  "default": "blue",
  normal: "black",
  warning: "yellow",
  error: "red",
  hidden: "white",
}

const renderer = {
  visitGroup({members}) {
    console.log("render group");
    return (
      <dl>
        {
          [].concat(...members.map(({tag, props = {}, node}) => {
            const {label = tag} = props;
            return [
              <dt key={`dt-${tag}`}>{label}</dt>,
              <dd key={`dd-${tag}`}>{node.accept(this)}</dd>
            ];
          }))
        }
      </dl>
    );
  },
  visitSelect({choices, isUserInput, choice, fullChoice: {resolvedMode}, detail, choose, unset}) {
    console.log("render select");
    return (
      <div>
        <span>
          <select
            value={choice}
            onChange={event => choose(event.target.value)}
            style={{color: modeColors[resolvedMode]}}
          >
            {
              choices.map(({tag, resolvedMode, props: {label = tag} = {}}) => {
                console.log("render choice", tag);
                return (
                  resolvedMode === "hidden" ? null :
                  <option
                    key={`option-${tag}`}
                    value={tag}
                    style={{color: modeColors[resolvedMode]}}
                  >
                    {label}{" "}[{resolvedMode}]
                  </option>
                );
              })
            }
          </select>
          {isUserInput &&
            <button onClick={unset}>unset</button>
          }
        </span>
        {console.log("render sel. detail"), detail && detail.accept(this)}
      </div>
    );
  },
  visitPrimitive({value = "", updateTo}) {
    console.log("render primitive");
    return (
      <input
        type="text"
        value={value}
        onChange={event => updateTo(event.target.value)}
      />
    );
  },
  visitUnit() {
    console.log("render unit");
    return null;
  },
  visitConfig() {
    console.log("render config");
    return (
      <span style={{color: "red", fontWeight: "bold", border: "2px solid red"}}>
        (renderer missing)
      </span>
    );
  },
};

class Configurator extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      config: { color: {$choice: "blue"} }
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
              console.log(JSON.stringify(newValue, null, 2))
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
