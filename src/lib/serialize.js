// Convert complex objects into flat arrays and back
// =================================================
//
// `deserialize(serialize(x))` is much like applying the "structured cloning
// algorithm" (SCA, see
// https://www.w3.org/TR/html5/infrastructure.html#safe-passing-of-structured-data)
// to `x`.  Aliasing and circular structures are supported, but:
// - Only a subset of the object classes handled by the SCA are supported.
// - If errors are thrown, they are not instances of DataCloneError.
//
// I did not spend the effort to serialize all the way down to a binary format.
// It was sufficient to use a data structure that's simple enough so that the
// SCA implementations of browsers can deal with it.
//
// This code has been implemented to work around browser bugs affecting
// cross-window messaging:
// - Chrome 48 does not preserve object and array entries with undefined values.
// - Neither Firefox 44 nor Chrome 48 preserve the lengths of sparse arrays.
//   (This actually fits with the WHATWG spec of the SCA at
//   https://html.spec.whatwg.org/multipage/infrastructure.html#structured-clone,
//   but that is obviously a bug in the spec.)
// We serialize values before sending them with Window.postMessage and
// deserialize them in the message handler.
//
// Do the same bugs appear in IndexedDB, which also uses the structured
// cloning algorithm?
//
// Additional advantages of using this code:
// - The serialized format is proper JSON data even if the original data
//   contains undefined values, which are not supported by JSON.  (Ditto for
//   String/Number/Boolean/Date objects. Those are not used by openCPQ, but
//   might be used by applications.)
// - If some deeply nested subobject cannot be handeled, you get an exception
//   at that point, not at the call to postMessage.  (At least in Chrome 48 the
//   error message does not tell which subobject causes the problem.)

export function serialize(root) {
  var out = [];
  var memory = new Map();

  function handle(o) {
    switch (typeof o) {
      case "undefined":
        out.push("?"); // Chrome 48 does not handle undefined properly.
        return;
      case "boolean":
      case "number":
      case "string":
        out.push(".", o);
        return;
      case "object": {
        if (o === null) {
          out.push(".", null);
          return;
        }
        const lookup = memory.get(o);
        if (lookup !== undefined) {
          out.push("^", lookup);
          return;
        }
        memory.set(o, memory.size);
        switch (o.constructor) {
          case Number:
            out.push("N", o.valueOf());
            return;
          case Boolean:
            out.push("B", o.valueOf());
            return;
          case String:
            out.push("S", o.valueOf());
            return;
          case Date:
            out.push("D", o.valueOf());
            return;
          case Array:
            out.push("[", o.length);
            o.forEach((v,i) => {
              out.push(i);
              handle(v);
            });
            out.push("]");
            return;
          case Object:
            out.push("{");
            Object.keys(o).map(k => {
              out.push(k);
              handle(o[k]);
            });
            out.push("}");
            return;
          default:
            throw `serialization not supported for class ${o.constructor.name}`;
        }
      }
      default:
        throw `serialization not supported for type '${typeof o}'`;
    }
  }

  handle(root);
  return out;
}

export function deserialize(list) {
  const memory = [];
  var i = 0;

  function extract() {
    function store(o) {
      memory.push(o);
      return o;
    }
    switch (list[i++]) {
      case "?":
        return undefined;
      case ".":
        return list[i++];
      case "N":
        return store(new Number(list[i++]));
      case "B":
        return store(new Boolean(list[i++]));
      case "S":
        return store(new String(list[i++]));
      case "D":
        return store(new Date(list[i++]));
      case "{": {
        const out = store({});
        while (list[i] !== "}")
          out[list[i++]] = extract();
        i++;
        return out;
      }
      case "[": {
        const out = store(new Array(list[i++]));
        while (list[i] !== "]")
          out[list[i++]] = extract();
        i++;
        return out;
      }
      case "^":
        return memory[list[i++]];
      default:
        throw `Unexpected tag '${list[i-1]}' found during deserialization.`
    }
  }

  const out = extract();
  if (i != list.length)
    throw `Unexpected end of serialized data at position ${i}, expected: ${list.length}`;
  return out;
}

/**
const circular = {
  foo: [1234],
  x: "asdf"
};
circular.backref = circular;
circular.bar = circular.foo;

const testObj = {
  null: null,
  undefined: undefined,
  array: [, , undefined, , null, undefined, , ],
  number: 77,
  boolean: false,
  string: "1235",
  Number: new Number(77),
  Boolean: new Boolean(false),
  String: new String("asdf"),
  Date: new Date(7000), // 7 seconds after the epoch
  circular: circular,
};

console.log(serialize(testObj));
const out = deserialize(serialize(testObj));
out.circular.backref.backref.foo[1] = "extra";
// "extra" appears as out.circular.foo[1] and out.circular.bar[1],
// but not in testObj:
console.log(testObj);
console.log(out);
/**/
