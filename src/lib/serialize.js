// Convert Complex Data Structures into Strings and Back
// =====================================================
//
// `serialize` converts a complex data structure into a string. `deserialize`
// converts such a string back into a data structure like the original one.
// `serialize` and `deserialize` properly handle the case that an object is
// aliased (that is, referenced multiple times) or even circular.
//
// `deserialize(serialize(x))` is much like applying the "structured cloning
// algorithm" (SCA, see
// https://www.w3.org/TR/html5/infrastructure.html#safe-passing-of-structured-data)
// to `x`.  Aliasing and circular structures are supported, except:
// - Only a subset of the object classes handled by the SCA are supported.
//   (Adding more classes should not be difficult, however.)
// - If errors are thrown, they are not instances of DataCloneError.
//
// On the serialization:
// - `undefined`, `null`, `true`, `false`, and numbers are serialized as in the
//   Javascript syntax.
// - In arrays and objects we do not use commas to *separate* entries, but
//   semicolons to *terminate* entries.  This is easy to parse and it avoids
//   ambiguities for sparse arrays.  (What's the length of the Javascript array
//   `[,]` and how is it printed?)
// - (Sub-)objects occurring serveral times in the data st
// - Number, Boolean, String, and Date objects are tagged with "N:", "B:", "S:",
//   and "D:", respectively.  The tag is followed by the object's value.
//   (Note that for dates this value is the number of milliseconds since the
//   epoch.)
//
// This code is intended for storing complex Javascript data structures in
// database fields.  But sending serialized values also helps to work around
// browser bugs affecting cross-window messaging:
// - Chrome 48 does not preserve object and array entries with undefined values.
// - Neither Firefox 44 nor Chrome 48 preserve the lengths of sparse arrays.
//   (This actually fits with the WHATWG spec of the SCA at
//   https://html.spec.whatwg.org/multipage/infrastructure.html#structured-clone,
//   as of early 2016, but that is obviously a bug in the spec.)
// - Furthermore some browsers do not give useful error messages if some deeply
//   nested subobject is not serializable.  (This problem happens at least for
//   Chrome 48.)  The code in this file fails at the appopriate place so that
//   you can localize the problem easily.
// (Do the same bugs appear in IndexedDB, which also uses the structured
// cloning algorithm?)

function serializeString(s) {
	return `"${s.replace(/[\\"]/g, '\\$&')}"`
}

function deserializeString(s) {
	return s.substring(1, s.length-1).replace(/\\(.)/g, "$1");
}

// Tags used in the `aliasInfo` map below:
const seen = new String("seen");
const aliased = new String("aliased");

export function serialize(root) {

	// `aliasInfo` maps objects reachable from `root` to
	// - `seen` upon the first occurrence in `preprocess`
	// - `aliased` upon the second occurrence in `preprocess`
	// - a unique number upon the first occurrence in `handle` if it was seen
	//   multiple times in `preprocess`.
	const aliasInfo = new Map();

  // First traversal of the data structure detecting aliased sub-objects:
	function preprocess(o) {
		if (typeof o === "object" && o !== null) {
			const n = aliasInfo.get(o);
			if (n === undefined) {
				aliasInfo.set(o, seen);
				Object.keys(o).forEach(k => preprocess(o[k]));
			}
			else if (n === seen)
				aliasInfo.set(o, aliased);
		}
	}
	preprocess(root);

	// "Provider" for unique labels for aliased sub-objects
	let labelCounter = 0;
	// Intermediate representation of the output as a list of tokens:
	const out = [];

	// Second traversal of the data structure doing the actual serialization:
  function handle(o) {
    switch (typeof o) {
      case "undefined":
        out.push("undefined");
        return;
      case "boolean":
      case "number":
				out.push(o);
				return;
      case "string":
        out.push(serializeString(o));
        return;
      case "object": {
        if (o === null) {
          out.push("null");
          return;
        }
        const lookup = aliasInfo.get(o);
				switch (lookup) {
					case seen:
						// non-aliased sub-object
						break;
					case aliased: {
						// first occurrence of an aliased sub-object
						const label = labelCounter++;
						out.push("#", label);
						aliasInfo.set(o, label);
						break;
					}
					default: {
						// second or later occurrence of an aliased sub-object
						out.push("^", lookup);
						return;
					}
				}
        switch (o.constructor) {
          case Number:
            out.push("N:", o.valueOf());
            return;
          case Boolean:
            out.push("B:", o.valueOf());
            return;
          case String:
            out.push("S:", serializeString(o.valueOf()));
            return;
          case Date:
            out.push("D:", o.valueOf());
            return;
          case Array: {
						let len = o.length;
						out.push("[");
						for (let i = 0; i < len; i++) {
							if (o.hasOwnProperty(i))
								handle(o[i]);
							out.push(";");
						}
						// Unsupported: keys that are not unsigned ints
						out.push("]");
						return;
					}
          case Object:
            out.push("{");
            Object.keys(o).map(k => {
              out.push(serializeString(k), ":");
              handle(o[k]);
							out.push(";")
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
  return out.join("");
}


const tokenRE = /^(?:undefined|null|false|true|[NBSD]:|[{}\[\];:#^]|"(?:[^\\"]|\\.)*"|[-+]?(?:Infinity|(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][-+]?[0-9]+)?))/;

// The following tests are only for distinguishing tokens matched by tokenRE.
function isStringToken(t) {
	return t[0] === '"';
}
function isNumberToken(t) {
	const c = t[0];
	return '0' <= c && c <= '9' || c === '.';
}
function isLabelToken(t) {
	return /^[0-9]$/.test(t);
}

export function deserialize(s) {
	let offset = 0;
	let next = null;

	function pushBack(token) {
		if (next !== null)
			throw "Internal parser error: duplicate push-back.";
		next = token;
	}

	function nextToken() {
		if (next) {
			const result = next;
			next = null;
			return result;
		}
		const rest = s.substring(offset);
		const match = tokenRE.exec(rest);
		if (!match)
			throw "Could not read token.";
		const result = match[0];
		offset += result.length;
		return result;
	}

	function expectNextToken(what, test) {
		const result = nextToken();
		if (!test(result)) {
			pushBack(result);
			throw `${what[0].toUpperCase() + what.substr(1)} expected.`;
		}
		return result;
	}

	function expectDelimiter(delim) {
		expectNextToken(`'${delim}'`, t => t === delim);
	}

	function lookAhead() {
		const result = nextToken();
		pushBack(result);
		return result;
	}

	const references = new Map();

	function parse(label) {
		function register(o) {
			if (label)
				references.set(label, o);
			return o;
		}
		const token = nextToken();
		switch (token) {
			case "undefined": return undefined;
			case "null": return null;
			case "false": return false;
			case "true": return true;
			case "N:": return register(new Number(parseFloat(
				expectNextToken("number", isNumberToken)
			)));
			case "S:": return register(new String(deserializeString(
				expectNextToken("string", isStringToken)
			)));
			case "B:": return register(new Boolean(
				expectNextToken("boolean", t => t === "true" || t === "false")
				=== "true"
			));
			case "D:": return register(new Date(parseInt(
				expectNextToken("integer", t => /^[-+]?[0-9]+$/.test(t))
			)))
			case "{": {
				const o = register({});
				for (;;) {
					if (lookAhead() === "}") {
						nextToken();
						return o;
					}
					const key = expectNextToken("string (key in object)", isStringToken);
					expectDelimiter(":");
					o[deserializeString(key)] = parse();
					expectDelimiter(";");
				}
			}
			case "[": {
				const a = register([]);
				for (let n = 0;; n++) {
					const token = nextToken();
					switch (token) {
						case ";":
							break;
						case "]":
							a.length = n;
						  return a;
						default:
							pushBack(token);
							a[n] = parse();
							expectDelimiter(";");
							break;
					}
				}
			}
			case "#":
				return parse(expectNextToken("label", isLabelToken));
			case "^": {
				const value = references.get(expectNextToken("label", isLabelToken));
				if (!value) {
					pushBack(ref);
					throw `Dangling reference «${ref}».`;
				}
				return value;
			}
			default:
				if (isStringToken(token))
					return deserializeString(token);
				else if	(isNumberToken(token))
					return parseFloat(token);
				else {
					pushBack(token);
					throw "Value expected.";
				}
		}
	}

	try {
		const result = parse();
		if (offset !== s.length)
			throw `Found extra text after parsed value.`;
		return result;
	}
	catch (e) {
		if (typeof(e) !== "string")
			throw e;
		if (next !== null)
			offset -= next.length;
		throw `Cannot parse serialized value `
		    + `at offset ${offset} `
		    + `looking at «${s.substr(offset, 10) +
					                (s.length > offset + 10 ? "..." : "")}»:`
				+ `\n${e}`;
	}
}

/**
function runTest(v) {
	console.log("=================");
	console.log(v);
	const v_s = serialize(v);
	console.log(v_s);
	console.log(deserialize(v_s));
}

const y = ["c", 1, null, true, undefined, 7.3e8,
	new Number(1234),
	new Boolean(false),
	new String("asdf"),
	new Date(1457700945401),
	,,];
const x = {a: "", b: ["b",, 'b\\"\'b', y,,], c: y};
x.b.push(x);
runTest({x, y});

[
	[], [,], [,,], [,,,],
	[1], [1,], [1,,], [1,,,],
	[1,2], [1,2,], [1,2,,], [1,2,,,],
	[1,,2], [1,,,2],
].forEach(runTest);

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
