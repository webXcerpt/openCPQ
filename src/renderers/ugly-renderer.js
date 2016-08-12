import React from "react";

const modeColors = {
  "default": "blue",
  normal: "black",
  warning: "yellow",
  error: "red",
  hidden: "white",
}

export default {

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
