import { IAssemblerState, AssemblerPhase } from "../types";
import { parseImmediate } from "../immediates";

const regexLength = /^\.fill\s+([-\w]+)$/i;
const regexLengthValue = /^\.fill\s+([-\w]+),\s*([-\w]+)$/i;

/**
 * .fill length[,value]
 * @param state Current assembler state.
 */
export default function fill(state: IAssemblerState): boolean {
  let lengthStr, length;
  let valueStr, value;

  let results = state.line.match(regexLength);
  if (results) {
    [, lengthStr] = results;
  }
  else {
    results = state.line.match(regexLengthValue);
    if (results) {
      [, lengthStr, valueStr] = results;
    }
    else {
      return false; // Neither regex matched.
    }
  }

  length = parseImmediate(lengthStr);
  if (length === null)
    throw new Error(`Could not parse .fill length ${lengthStr}`);
  if (length < 0)
    throw new Error(".fill length must be positive.");

  if (valueStr) {
    value = parseImmediate(valueStr);
    if (value === null)
      throw new Error(`Could not parse .fill value ${valueStr}`);
  }
  else
    value = 0;

  if (state.currentPass === AssemblerPhase.secondPass) {
    for (let i = 0; i < length; i++)
      state.dataView.setUint8(state.outIndex + i, value);
  }

  state.outIndex += length;

  return true;
}
