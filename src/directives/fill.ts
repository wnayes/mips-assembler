import { AssemblerPhase } from "../types";
import { IAssemblerState } from "../state";
import { runFunction } from "../functions";

const regex = /^\.fill\s+/i;

/**
 * .fill length[,value]
 * @param state Current assembler state.
 */
export default function fill(state: IAssemblerState): boolean {
  const results = state.line.match(regex);
  if (results === null)
    return false;

  if (!state.lineExpressions.length || state.lineExpressions.length > 2) {
    throw new Error(".fill directive takes a length and optional value");
  }

  let length, value;
  length = runFunction(state.lineExpressions[0], state);
  if (typeof length !== "number")
    throw new Error(`Could not parse .fill length ${state.lineExpressions[0]}`);
  if (length < 0)
    throw new Error(".fill length must be positive.");

  if (state.lineExpressions.length > 1) {
    value = runFunction(state.lineExpressions[1], state);
    if (typeof value !== "number")
      throw new Error(`Could not parse .fill value ${state.lineExpressions[1]}`);
  }
  else
    value = 0;

  if (state.currentPass === AssemblerPhase.secondPass) {
    for (let i = 0; i < length; i++)
      state.dataView.setInt8(state.outIndex + i, value);
  }

  state.outIndex += length;

  return true;
}
