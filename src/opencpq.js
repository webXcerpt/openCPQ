import I from "immutable";

// Nodes are not eagerly constructed upon construction of their parent nodes,
// but lazily when they are first accessed.  The property where a parent node
// holds a child node is temporarily set to the marker object `EVALUATING` while
// the child node is being evaluated.  This allows to detect circular
// dependencies.
const EVALUATING = ["EVALUATING"];

function checkCache(holder, prop) {
  console.log("checkCache", holder, prop);
  if (holder.hasOwnProperty(prop)) {
    if (holder[prop] === EVALUATING) {
      debugger;
      throw new Error("circular dependency");
    }
    return true;
  }
  else {
    holder[prop] = EVALUATING;
    return false;
  }
}

const addVisitorNames = (options = {}, ...props) => {
  const {visitorNames = []} = options;
  return {...options, visitorNames: [...visitorNames, ...props]}
}

export class ConfigNode {
  constructor(ctx, options) {
    this._ctx = {...ctx, node: this};
    this._options = addVisitorNames(options, "visitConfig");
  }

  get props() {
    return this._options.props;
  }

  get rawValue() {
    return this._ctx.value;
  }

  get parent() {
    return this._ctx.parent;
  }

  accept(visitor) {
    console.log("accept visitor:", visitor);
    const name = this._options.visitorNames.find(n => visitor.hasOwnProperty(n));
    console.log("accept name:", name);
    return name && visitor[name](this);
  }
}

export class GroupNode extends ConfigNode {
  constructor(ctx, options, rawMembers) {
    super(ctx, addVisitorNames(options, "visitGroup"));

    const memberTags = this._memberTags = [];
    const membersByTag = this._membersByTag = {};
    const thisCtx = this._ctx;

    function process(rawMembers) {
      if (!rawMembers) {
        // do nothing
      }
      else if (rawMembers instanceof Array) {
        rawMembers.forEach(process);
      }
      else if (rawMembers instanceof Function) {
        process(rawMembers(thisCtx));
      }
      else {
        const {tag} = rawMembers;
        memberTags.push(tag);
        // Copy the member so we can add more props without changing the
        // original:
        membersByTag[tag] = {...rawMembers};
      }
    }

    process(rawMembers);
  }

  member(tag) {
    const member = this._membersByTag[tag];
    if (member === undefined) {
      return undefined; // TODO throw an exception?
    }
    if (checkCache(member, "node")) {
      return member;
    }

    const {detail} = member;
    const ctx = this._ctx;
    const {value = {}, updateTo} = ctx;
    const node = detail({
      ...ctx,
      parent: this,
      // ### should we always descend?
      value: value[tag],
      updateTo: newValue => updateTo({...value, [tag]: newValue}),
    });

    member.node = node;
    return member;
  }

  hasMember(tag) {
    console.log("GN hasMember", tag, this._membersByTag);
    return this._membersByTag.hasOwnProperty(tag);
  }

  get memberTags() {
    return this._memberTags;
  }

  // This method is eager.  Calling it during node-tree enrichment increases the
  // risk of circular dependencies.
  get members() {
    return this._memberTags.map(tag => this.member(tag));
  }
}

function resolveMode(ctx, choice) {
  console.log("resolveMode", choice);
  if (checkCache(choice, "resolvedMode")) {
    console.log("resolveMode, cached");
    return choice.resolvedMode;
  }
  const {mode} = choice;
  console.log("resolveMode, not cached, mode:", mode);
  return choice.resolvedMode =
    mode === undefined ? "normal":
    mode instanceof Function ? mode(ctx) :
    mode;
}

const modes = ["default", "normal", "warning", "error", "hidden"];

const modeIndices = {};
modes.forEach((mode, i) => modeIndices[mode] = i);

// TODO Make findBestChoice overridable in the SelectNode options?
// TODO And/or make it globally injectable?  Use a visitor?
function findBestChoice(ctx, choices) {
  console.log("findBestChoice");
  let i = modes.length;
  let bestChoice = undefined;
  choices.forEach(choice => {
    console.log("findBestChoice, choice.tag:", choice.tag);
    const j = modeIndices[resolveMode(ctx, choice)];
    console.log("findBestChoice, modes[j]:", modes[j]);
    if (j < i) {
      i = j;
      bestChoice = choice;
    }
  });
  return bestChoice;
}

export class SelectNode extends ConfigNode {
  constructor(ctx, options, rawChoices) {
    super(ctx, addVisitorNames(options, "visitSelect"));

    const choiceTags = this._choiceTags = [];
    const choicesByTag = this._choicesByTag = {};
    const thisCtx = this._ctx;

    function process(rawChoices) {
      if (!rawChoices) {
        // do nothing
      }
      else if (rawChoices instanceof Array) {
        rawChoices.forEach(process);
      }
      else if (rawChoices instanceof Function) {
        process(rawChoices(thisCtx));
      }
      else {
        const {tag} = rawChoices;
        choiceTags.push(tag);
        // Copy the choice so we can add more props without changing the
        // original:
        choicesByTag[tag] = {...rawChoices};
      }
    }

    process(rawChoices);
  }

  get choices() {
    return this._choiceTags.map(tag => {
      const choice = this._choicesByTag[tag];
      resolveMode(this._ctx, choice);
      return choice;
    });
  }

  _determineChoice() {
    if (checkCache(this, "_choice")) {
      return;
    }
    const {value = {}} = this._ctx;
    this._choice = (this._isUserInput = value.$choice !== undefined)
      ? value.$choice
      : findBestChoice(this._ctx, this.choices).tag;
  }

  get isUserInput() {
    this._determineChoice();
    return this._isUserInput;
  }

  get choice() {
    this._determineChoice();
    return this._choice;
  }

  set choice(newChoice) {
    if (newChoice === this.choice) {
      return;
    }
    this._ctx.updateTo({$choice: newChoice});
  }

  get fullChoice() {
    const {choice} = this;
    const fullChoice = this._choicesByTag[choice];
    console.log("fullChoice:", choice, fullChoice);
    resolveMode(this._ctx, fullChoice);
    return fullChoice;
  }

  get choose() {
    return newChoice => this.choice = newChoice;
  }

  get unset() {
    return () => this.choose(undefined);
  }

  get detail() {
    if (checkCache(this, "_detail")) {
      return this._detail;
    }

    const detailType = this._choicesByTag[this.choice].detail || (() => undefined);
    const {value, updateTo} = this._ctx;
    return this._detail = detailType({
      ...this._ctx,
      parent: this,
      value: value && value.$detail,
      updateTo: newValue => updateTo({...value, $detail: newValue}),
    });
  }
}

export class EitherNode extends ConfigNode {
  constructor(ctx, options, yesDetail, noDetail) {
    super(ctx, addVisitorNames(options, "visitOption"));
    this._yesDetail = yesDetail;
    this._noDetail = noDetail;
  }

  _determineChoice() {
    if (checkCache(this, "_choice")) {
      return;
    }
    const {value = {}} = this._ctx;
    this._choice = (this._isUserInput = value.$choice !== undefined)
      ? value.$choice
      : this._options.defaultChoice;
  }

  get isUserInput() {
    this._determineChoice();
    return this._isUserInput;
  }

  get choice() {
    this._determineChoice();
    return this._choice;
  }

  set choice(newChoice) {
    if (newChoice === this.choice) {
      return;
    }
    this._ctx.updateTo({$choice: newChoice});
  }

  get choose() {
    return newChoice => this.choice = newChoice;
  }

  get unset() {
    return () => this.choose(undefined);
  }

  get detail() {
    if (checkCache(this, "_detail")) {
      return this._detail;
    }

    const detailType =
      (this.choice ? this._yesDetail : this._noDetail) ||
      (() => undefined);
    const {value, updateTo} = this._ctx;
    return this._detail = detailType({
      ...this._ctx,
      parent: this,
      value: value && value.$detail,
      updateTo: newValue => updateTo({...value, $detail: newValue}),
    });
  }
}

export class ListNode extends ConfigNode {
  constructor(ctx, options, element) {
    super(ctx, addVisitorNames(options, "visitList"));

    this._elementType = element;
    this._elementData = ctx.value.map(elem => ({}));
  }

  get length() {
    return this._elementData.length;
  }

  element(i) {
    if (i < 0 || i >= this.length) {
      throw new Error("out of range");
    }
    const elementIData = this._elementData[i];
    if (checkCache(elementIData, "value")) {
      return elementIData.value;
    }

    const {value, updateTo} = this._ctx;
    return elementIData.value = elementType({
      ...this._ctx,
      parent: this,
      value: value[i],
      updateTo: newValue =>
        updateTo([...value.slice(0, i), newValue, ...value.slice(i + 1)]),
    });
  }

  insertAt(i, newValue) {
    if (i < 0 || i > this.length) {
      throw new Error("out of range");
    }
    const {value, updateTo} = this._ctx;
    updateTo([...value.slice(0, i), newValue, ...value.slice(i)]);
  }

  deleteAt(i) {
    if (i < 0 || i >= this.length) {
      throw new Error("out of range");
    }
    const {value, updateTo} = this._ctx;
    updateTo([...value.slice(0, i), ...value.slice(i + 1)])
  }
}

export class PrimitiveNode extends ConfigNode {
  constructor(ctx, options) {
    super(ctx, addVisitorNames(options, "visitPrimitive"));
  }

  get value() {
    return this._ctx.value;
  }

  set value(newValue) {
    this._ctx.updateTo(newValue);
  }

  get updateTo() {
    return newValue => this.value = newValue;
  }
}

export class UnitNode extends ConfigNode {
  constructor(ctx, options) {
    super(ctx, addVisitorNames(options, "visitUnit"));
  }
}


const withOptions = args =>
  args[0] == undefined ||
  args[0] instanceof Array ||
  args[0] instanceof Function
  ? [{}, ...args]
  : args;

export function CGroup(...args) {
  return ctx => new GroupNode(ctx, ...withOptions(args));
}

export function CSelect(...args) {
  return ctx => new SelectNode(ctx, ...withOptions(args));
}

export function CEither(...args) {
  return ctx => new EitherNode(ctx, ...withOptions(args));
}

export function CList(...args) {
  return ctx => new ListNode(ctx, ...withOptions(args));
}

export function CPrimitive(options) {
  return ctx => new PrimitiveNode(ctx, options);
}

export function CUnit(options) {
  return ctx => new UnitNode(ctx, options);
}

export const CText = CPrimitive;
export const CNumeric = CPrimitive;

// TODO Do we really need this? Is this too specific?  Is it hacky?
// Should it go to app code?
export function cref(ctx, name) {
  let found = false;
  let value = undefined;
  console.log("cref 0", ctx);
  for (let node = ctx.node; !found && node; node = node.parent) {
    console.log("cref 1", node);
    node.accept({
      visitGroup(node) {
        console.log("cref 2", node);
        if (node.hasMember(name)) {
          console.log("cref 3: found", node.member(name).node);
          found = true;
          value = node.member(name).node;
        }
        console.log("cref 4");
      }
    });
    console.log("cref 5; found:", found);
  }
  console.log("cref not found", name);
  return value;
}
