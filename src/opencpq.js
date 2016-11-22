import Immutable from "immutable";


const emptyMap = Immutable.Map();
const emptyList = Immutable.List();
const identity = x => x;

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
  return {...options, visitorNames: [...visitorNames, ...moreNames]};
};

export class ConfigNode {
  constructor(ctx, options, defaultDefaultValue, visitorName) {
    this._ctx = {...ctx, node: this};
    this._options = addVisitorNames(
      { defaultValue: defaultDefaultValue, ...options },
      visitorName, "visitConfig"
    );
  }

  get options() {
    return this._options;
  }

  get defaultValue() {
    return this.options.defaultValue;
  }

  get props() {
    return this._options.props;
  }

  get rawValue() {
    return this._ctx.value;
  }

  get plainValue() {
    const rawValue = this.rawValue;
    return rawValue !== undefined ? rawValue : this.defaultValue;
  }

  get updateThisTo() {
    return newValue => {
      const { transformUpdate = identity } = this.options;
      return this._ctx.updateTo(transformUpdate(newValue, this.plainValue));
    };
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
    super(ctx, options, emptyMap, "visitGroup");

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
      const {tag, detail = CUnit()} = member;
      const ctx = this._ctx;
      const {value = this.defaultValue} = ctx;
      return detail({
        ...ctx,
        parent: this,
        id: `${this.id}.${tag}`,
        // ### should we always descend?
        value: value.get(tag),
        updateTo: newValue => this.updateThisTo(value.set(tag, newValue)),
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
    super(ctx, options, emptyMap, "visitSelect");

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
      const {value = this.defaultValue} = this._ctx;
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
    this.updateThisTo(Immutable.Map.of("$choice", newChoice));
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
      const {value = this.defaultValue} = this._ctx;
      return detailType({
        ...this._ctx,
        parent: this,
        id: `${this.id}.$detail`,
        value: value.get("$detail"),
        updateTo: newValue => this.updateThisTo(value.set("$detail", newValue)),
      });
    });
  }
}

export class EitherNode extends ConfigNode {
  constructor(ctx, options, yesDetail, noDetail) {
    super(ctx, options, emptyMap, "visitEither");
    this._yesDetail = yesDetail;
    this._noDetail = noDetail;
  }

  _determineChoice() {
    cache(this, "_choice", () => {
      const {value = this.defaultValue} = this._ctx;
      const $choice = value.get("$choice");
      // FIXME Check for user input in the value before using the default value.
      // (Also in other node types?)
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
    this.updateThisTo(Immutable.Map.of("$choice", newChoice));
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
      const {value = this.defaultValue} = this._ctx;
      return detailType({
        ...this._ctx,
        parent: this,
        id: `${this.id}.$detail`,
        value: value.get("$detail"),
        updateTo: newValue => this.updateThisTo(value.set("$detail", newValue)),
      });
    });
  }
}

export class ListNode extends ConfigNode {
  // TODO: It would be nice if node could be asked whether insertions/deletions
  // are possible without violating the length constraints.

  constructor(ctx, options, element) {
    super(ctx, options, emptyList, "visitList");

    this._elementType = element;
    const {value = this.defaultValue} = ctx;
    this._elementData = value.toArray().map(() => ({}));
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
      const {value = this.defaultValue} = this._ctx;
      return (this._elementType)({
        ...this._ctx,
        parent: this,
        id: `${this.id}[${i}]`,
        value: value.get(i),
        updateTo: newValue => this.updateThisTo(value.set(i, newValue)),
      });
    });
  }

  get elements() {
    return this._elementData.map((_, i) => this.element(i));
  }

  insertAt(i, newValue) {
    if (i < 0 || i > this.length) {
      throw new Error("index out of range");
    }
    const {value = this.defaultValue} = this._ctx;
    const {maxLength = Infinity} = this._options;
    if (value.size >= maxLength) {
      throw new Error("list too long");
    }
    this.updateThisTo(value.insert(i, newValue));
  }

  deleteAt(i) {
    if (i < 0 || i >= this.length) {
      throw new Error("index out of range");
    }
    const {value = this.defaultValue} = this._ctx;
    const {minLength = 0} = this._options;
    if (value.size <= minLength) {
      throw new Error("list too short");
    }
    this.updateThisTo(value.delete(i));
  }
}

export class PrimitiveNode extends ConfigNode {
  constructor(ctx, options) {
    super(ctx, options, undefined, "visitPrimitive");
  }

  get value() {
    return this._ctx.value;
  }

  set value(newValue) {
    this.updateThisTo(newValue);
  }

  get updateTo() {
    return newValue => this.value = newValue;
  }
}

export class UnitNode extends ConfigNode {
  constructor(ctx, options) {
    super(ctx, options, undefined, "visitUnit");
  }
}

const emptyUndo = Immutable.Map({
  past: emptyList,
  current: undefined,
  future: emptyList,
});

export class UndoNode extends ConfigNode {
  constructor(ctx, options, subtype) {
    super(ctx, options, undefined, "visitUndo");
    this._subtype = subtype;
    const { defaultValue = emptyUndo } = options;
    const { value = defaultValue } = ctx;
    this._past = value.get('past');
    this._current = value.get('current');
    this._future = value.get('future');
  }

  get current() {
    return this._subtype({
      ...this._ctx,
      parent: this,
      id: `${this.id}.undoable`,
      value: this._current,
      updateTo: this.updateTo,
    });
  }

  set current(newValue) {
    this.updateThisTo(Immutable.Map({
      past: this._past.push(this._current),
      current: newValue,
      future: emptyList,
    }));
  }

  get updateTo() {
    return newValue => this.current = newValue;
  }

  get undo() {
    return !this._past.isEmpty() && (() => this.updateThisTo(Immutable.Map({
      past: this._past.pop(),
      current: this._past.last(),
      future: this._future.unshift(this._current),
    })));
  }

  get redo() {
    return !this._future.isEmpty() && (() => this.updateThisTo(Immutable.Map({
      past: this._past.push(this._current),
      current: this._future.first(),
      future: this._future.shift(),
    })));
  }
}

export class WrapperNode extends ConfigNode {
  constructor(ctx, options, subtype) {
    super(ctx, options, undefined, "visitWrapper");
    this._subtype = subtype;
  }

  get subtype() {
    return this._subtype;
  }

  get child() {
    return this._subtype({
      ...this._ctx,
      parent: this,
      id: `${this.id}.wrapped`,
      updateTo: this.updateTo,
    });
  }

  set child(newValue) {
    this.updateThisTo(newValue);
  }

  get updateTo() {
    return newValue => this.child = newValue;
  }

}


// Idea: interceptors for update methods
// The modeler should be enabled to provide checks which are performed by
// update methods.  If the check fails, the update is prohibited.
// (Or should we "just" subclass the node types to achieve this?)
// - The minLength/maxLength checks for lists could be implemented this way.

const withOptions = args => args.length <= 1 ? [{}, ...args] : args;

export function CGroup(...args) {
  return ctx => new GroupNode(ctx, ...withOptions(args));
}

export function CSelect(...args) {
  return ctx => new SelectNode(ctx, ...withOptions(args));
}

export function CEither(...args) {
  const arg0 = args[0];
  if (arg0 === undefined || arg0 instanceof Function) {
    args = [{}, ...args];
  }
  return ctx => new EitherNode(ctx, ...args);
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

export function CUndo(...args) {
  return ctx => new UndoNode(ctx, ...withOptions(args));
}

export function CWrapper(...args) {
  return ctx => new WrapperNode(ctx, ...withOptions(args));
}
