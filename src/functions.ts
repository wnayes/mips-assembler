import { IAssemblerState } from "./types";
import { parseImmediate, formatImmediate } from "./immediates";
import { getSymbolValue } from "./symbols";
import { unescapeQuotes } from "./strings";
import { LABEL_CHARS } from "./labels";

/** Runs any built-in functions, and also resolves symbols. */
export function runFunction(value: string, state: IAssemblerState): string | number | null {
  return _runFunction(value, state);
}

const fnRegex = new RegExp(`^(\\w+)\\(([\\(\\),\\w${LABEL_CHARS}]*)\\)$`);

function _runFunction(value: string, state: IAssemblerState): string | number | null {
  const results = fnRegex.exec(value);
  if (results === null) { // Not a function
    // Number?
    let imm = parseImmediate(value);
    if (imm !== null) {
      return imm;
    }

    // String?
    let str = unescapeQuotes(value);
    if (typeof str === "string") {
      return str;
    }

    const symbolValue = getSymbolValue(state, value);
    if (symbolValue !== null) {
      return symbolValue;
    }

    return null;
  }
  else {
    const [, fn, args] = results;
    if (!fns[fn]) {
      // Did a symbol label accidentally look like a function?
      const symbolValue = getSymbolValue(state, fn);
      if (symbolValue !== null) {
        return symbolValue;
      }

      return null; // Might have been something like 0x10(V0)
    }

    // TODO: Doesn't support nested calls, multiple arguments.
    return fns[fn](state, _runFunction(args, state)!);
  }
}

interface IAssemblerFunction {
  (state: IAssemblerState, value: string | number): number;
}

/** Built-in functions */
const fns: { [fnName: string]: IAssemblerFunction } = Object.create(null);

fns.hi = function(state: IAssemblerState, value: string | number): number {
  if (typeof value === "string")
    throw new Error(`Assembler function hi cannot be called with string "${value}", value must be a number.`);

  let lower = value & 0x0000FFFF;
  let upper = value >>> 16;
  if (lower & 0x8000)
    upper += 1;
  return upper;
};

fns.lo = function(state: IAssemblerState, value: string | number): number {
  if (typeof value === "string")
    throw new Error(`Assembler function lo cannot be called with string "${value}", value must be a number.`);

  return value & 0x0000FFFF;
};

/** Current memory address */
fns.org = function(state: IAssemblerState, value: string | number): number {
  return state.memPos + state.outIndex;
};
