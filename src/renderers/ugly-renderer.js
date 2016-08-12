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
        {detail && detail.accept(this)}
      </div>
    );
  },

  visitPrimitive({value = "", updateTo}) {
    return (
      <input
        type="text"
        value={value}
        onChange={event => updateTo(event.target.value)}
      />
    );
  },

  visitUnit() {
    return null;
  },

  visitConfig() {
    return (
      <span style={{color: "red", fontWeight: "bold", border: "2px solid red"}}>
        (renderer missing)
      </span>
    );
  },

};
