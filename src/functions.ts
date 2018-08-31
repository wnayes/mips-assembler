import { IAssemblerState } from "./types";
import { parseImmediate } from "./immediates";
import { getSymbolValue } from "./symbols";

/** Runs any built-in functions, and also resolves symbols. */
export function runFunction(value: string, state: IAssemblerState): string {
  // Don't parse an immediate on the root call.
  const result = _runFunction(value, state, false);
  if (result !== null)
    return "0x" + result.toString(16).toUpperCase();
  return null;
}

function _runFunction(value: string, state: IAssemblerState, doParseImmediate: boolean): number | null {
  const fnRegex = /^(\w+)\(([\(\),\w+]+)\)$/;
  const results = fnRegex.exec(value);
  if (results === null) { // Not a function
    let imm = null;
    if (doParseImmediate && (imm = parseImmediate(value)) !== null) {
      return imm;
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
    return fns[fn].call(fns[fn], _runFunction(args, state, true));
  }
}

interface IAssemblerFunction {
  (value: number): number;
}

const fns: { [fnName: string]: IAssemblerFunction } = {
  hi: function(value: number): number {
    let lower = value & 0x0000FFFF;
    let upper = value >>> 16;
    if (lower & 0x8000)
      upper += 1;
    return upper;
  },

  lo: function(value: number): number {
    return value & 0x0000FFFF;
  },
};
