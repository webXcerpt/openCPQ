import Immutable from "immutable";


const emptyMap = Immutable.Map();
const emptyList = Immutable.List();

// Various values are constructed lazily when they are first accessed.  The
// property for the value is temporarily set to the marker object `EVALUATING`
// while the value is being evaluated.  This allows to detect circular
// dependencies.
const EVALUATING = Symbol("EVALUATING");

function cache(holder, prop, calc) {
  if (holder.hasOwnProperty(prop)) {
    const value = holder[prop];
    if (value === EVALUATING) {
      throw new Error("circular dependency");
    }
    return value;
  }
  else {
    holder[prop] = EVALUATING;
    const value = calc();
    holder[prop] = value;
    return value;
  }
}

const addVisitorNames = (options = {}, ...moreNames) => {
  const {visitorNames = []} = options;
  return {...options, visitorNames: [...visitorNames, ...moreNames]}
}

export class ConfigNode {
  constructor(ctx, options) {
    this._ctx = {...ctx, node: this};
    this._options = addVisitorNames(options, "visitConfig");
  }

  get options() {
    return this._options;
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

  get id() {
    return this._ctx.id;
  }

  accept(visitor) {
    const name = this._options.visitorNames.find(n => visitor.hasOwnProperty(n));
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
    cache(member, "node", () => {
      const {tag, detail} = member;
      const ctx = this._ctx;
      const {value = emptyMap, updateTo} = ctx;
      return detail({
        ...ctx,
        parent: this,
        id: `${this.id}.${tag}`,
        // ### should we always descend?
        value: value.get(tag),
        updateTo: newValue => updateTo(value.set(tag, newValue)),
      });
    });
    return member;
  }

  hasMember(tag) {
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
  return cache(choice, "resolvedMode", () => {
    const {mode} = choice;
    return (
      mode === undefined ? "normal":
      mode instanceof Function ? mode(ctx) :
      mode
    );
  });
}

const modes = ["default", "normal", "warning", "error", "hidden"];

const modeIndices = {};
modes.forEach((mode, i) => modeIndices[mode] = i);

// TODO Make findBestChoice overridable in the SelectNode options?
// TODO And/or make it globally injectable?  Use a visitor?
function findBestChoice(ctx, choices) {
  let i = modes.length;
  let bestChoice = undefined;
  choices.forEach(choice => {
    const j = modeIndices[resolveMode(ctx, choice)];
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
    cache(this, "_choice", () => {
      const {value = emptyMap} = this._ctx;
      const $choice = value.get("$choice");
      const isUserInput = $choice !== undefined;
      this._isUserInput = isUserInput;
      return isUserInput ? $choice : findBestChoice(this._ctx, this.choices).tag;
    });
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
    this._ctx.updateTo(Immutable.Map.of("$choice", newChoice));
  }

  get fullChoice() {
    const {choice} = this;
    const fullChoice = this._choicesByTag[choice];
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
    return cache(this, "_detail", () => {
      const detailType = this._choicesByTag[this.choice].detail || (() => undefined);
      const {value = emptyMap, updateTo} = this._ctx;
      return detailType({
        ...this._ctx,
        parent: this,
        id: `${this.id}.$detail`,
        value: value.get("$detail"),
        updateTo: newValue => updateTo(value.set("$detail", newValue)),
      });
    });
  }
}

export class EitherNode extends ConfigNode {
  constructor(ctx, options, yesDetail, noDetail) {
    super(ctx, addVisitorNames(options, "visitEither"));
    this._yesDetail = yesDetail;
    this._noDetail = noDetail;
  }

  _determineChoice() {
    cache(this, "_choice", () => {
      const {value = emptyMap} = this._ctx;
      const $choice = value.get("$choice");
      const isUserInput = $choice !== undefined;
      this._isUserInput = isUserInput;
      return isUserInput ? $choice : this._options.defaultChoice;
    });
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
    return cache(this, "_detail", () => {
      const detailType =
        (this.choice ? this._yesDetail : this._noDetail) ||
        (() => undefined);
      const {value = emptyMap, updateTo} = this._ctx;
      return detailType({
        ...this._ctx,
        parent: this,
        id: `${this.id}.$detail`,
        value: value.get("$detail"),
        updateTo: newValue => updateTo(value.set("$detail", newValue)),
      });
    });
  }
}

export class ListNode extends ConfigNode {
  constructor(ctx, options, element) {
    super(ctx, addVisitorNames(options, "visitList"));

    this._elementType = element;
    const {value = emptyList} = ctx;
    this._elementData = value.toArray().map(elem => ({}));
  }

  get length() {
    return this._elementData.length;
  }

  element(i) {
    if (i < 0 || i >= this.length) {
      throw new Error("out of range");
    }
    const elementIData = this._elementData[i];
    return cache(elementIData, "value", () => {
      const {value = emptyList, updateTo} = this._ctx;
      return (this._elementType)({
        ...this._ctx,
        parent: this,
        id: `${this.id}[${i}]`,
        value: value.get(i),
        updateTo: newValue => updateTo(value.set(i, newValue)),
      });
    });
  }

  get elements() {
    return this._elementData.map((_, i) => this.element(i));
  }

  insertAt(i, newValue) {
    if (i < 0 || i > this.length) {
      throw new Error("out of range");
    }
    const {value = emptyList, updateTo} = this._ctx;
    updateTo(value.insert(i, newValue));
  }

  deleteAt(i) {
    if (i < 0 || i >= this.length) {
      throw new Error("out of range");
    }
    const {value = emptyList, updateTo} = this._ctx;
    updateTo(value.delete(i))
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


const withOptions = args => args.length <= 1 ? [{}, ...args] : args;

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
