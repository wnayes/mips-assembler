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
    const [, fn] = results;
    if (!fns[fn]) {
      // Did a symbol label accidentally look like a function?
      const symbolValue = getSymbolValue(state, fn);
      if (symbolValue !== null) {
        return symbolValue;
      }

      return null; // Might have been something like 0x10(V0)
    }

    // Parse args slightly different than the regex suggests,
    // to support lo(label)(V0)
    let fnArgs = "";
    let parenLevel = 0;
    let i;
    for (i = fn.length + 1; i < value.length - 1; i++) {
      const char = value[i];
      if (char === "(") {
        parenLevel++;
      }
      else if (char === ")") {
        parenLevel--;
        if (parenLevel < 0) {
          i++;
          break;
        }
      }

      fnArgs += char;
    }

    let extraStr: string | undefined;
    if (i < value.length - 1) {
      // There was extra content after the end of the function,
      // like the (VO) of lo(label)(V0)
      extraStr = value.substring(i, value.length);
      return fns[fn](state, _runFunction(fnArgs, state)!) + extraStr;
    }

    // TODO: Doesn't support nested calls, multiple arguments.
    return fns[fn](state, _runFunction(fnArgs, state)!);
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
