import { AssemblerPhase } from "../types";
import { IAssemblerState } from "../state";
import { runFunction } from "../functions";

const regexAscii = /^\.ascii\s+/i;
const regexAsciiZ = /^\.asciiz\s+/i;

/**
 * .ascii value[,...]
 * .asciiz value[,...]
 *
 * `value` can either be a string or byte value.
 * ex: "string"
 * ex: 'string'
 * ex: 0x0A
 *
 * @param state Current assembler state.
 */
export default function ascii(state: IAssemblerState): boolean {
  let appendZero = false;
  let results = state.line.match(regexAscii);
  if (!results) {
    results = state.line.match(regexAsciiZ);
    if (!results)
      return false;
    appendZero = true;
  }

  const numbers: number[] = [];

  const lineExps = state.lineExpressions;
  lineExps.forEach((expr) => {
    const value = runFunction(expr, state);
    if (value === null)
      throw new Error("Could not parse .ascii value " + expr);
    if (typeof value === "number") {
      numbers.push(value);
    }
    else if (typeof value === "string") {
      for (let i = 0; i < value.length; i++) {
        numbers.push(value.charCodeAt(i));
      }
    }
  });

  if (appendZero)
    numbers.push(0); // Add NULL byte.

  if (state.currentPass === AssemblerPhase.secondPass) {
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] < 0)
        state.dataView.setInt8(state.outIndex + i, numbers[i]);
      else
        state.dataView.setUint8(state.outIndex + i, numbers[i]);
    }
  }

  state.outIndex += numbers.length;

  return true;
}
