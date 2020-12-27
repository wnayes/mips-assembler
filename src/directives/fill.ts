import { AssemblerPhase } from "../types";
import { IAssemblerState } from "../state";
import { runFunction } from "../functions";
import { throwError } from "../errors";
import { basicDirectiveMatcher } from "./directiveHelpers";

/**
 * .fill length[,value]
 * @param state Current assembler state.
 */
export default function fill(state: IAssemblerState): boolean {
  if (!state.lineExpressions.length || state.lineExpressions.length > 2) {
    throwError(".fill directive takes a length and optional value", state);
  }

  let length, value;
  length = runFunction(state.lineExpressions[0], state);
  if (typeof length !== "number") {
    throwError(`Could not parse .fill length ${state.lineExpressions[0]}`, state);
    return false;
  }
  if (length < 0)
    throwError(".fill length must be positive.", state);

  if (state.lineExpressions.length > 1) {
    value = runFunction(state.lineExpressions[1], state);
    if (typeof value !== "number") {
      throwError(`Could not parse .fill value ${state.lineExpressions[1]}`, state);
      return false;
    }
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
fill.matches = basicDirectiveMatcher("fill");
