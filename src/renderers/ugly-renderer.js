import React from "react";

import modeColors from "./mode-colors.js";


const visitor = {

  visitGroup({members}) {
    return (
      <dl>
        {
          [].concat(...members.map(({tag, props = {}, node}) => {
            const {label = tag} = props;
            return [
              <dt key={`dt-${tag}`}>{label}</dt>,
              <dd key={`dd-${tag}`}>{renderUgly(node)}</dd>
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
        {detail && renderUgly(detail)}
      </div>
    );
  },

  visitList(node) {
    return (
      <ul>
        {[].concat(...node.elements.map((element, i) => [
          <li key={`plus-${i}`}>
            <button onClick={() => node.insertAt(i, undefined)}>+</button>
          </li>,
          <li key={`elem-${i}`}>
            <button onClick={() => node.deleteAt(i)}>&minus;</button>
            <div>
              {renderUgly(element)}
            </div>
          </li>
        ]))}
        <li><button onClick={() => node.insertAt(node.length)}>+</button></li>
      </ul>
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

function renderUgly(node) {
  const {options: {props: {render} = {}} = {}} = node;
  return render ? render(node) : node.accept(visitor);
}

export default renderUgly;
