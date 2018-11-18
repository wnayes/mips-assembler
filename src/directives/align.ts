import { IAssemblerState, AssemblerPhase } from "../types";
import { runFunction } from "../functions";

const alignRegex = /^\.align\s+/i;

/**
 * .align pads zeroes until the output position is aligned
 * with the specified alignment.
 * @param state Current assembler state.
 */
export default function align(state: IAssemblerState): boolean {
  const results = state.line.match(alignRegex);
  if (results === null)
    return false; // Not .align

  if (state.lineExpressions.length !== 1) {
    throw new Error(".align requires one power of two number argument");
  }

  const imm = runFunction(state.lineExpressions[0], state);
  if (imm === null)
    throw new Error(`Could not parse .align immediate ${state.lineExpressions}`);
  if (typeof imm !== "number")
    throw new Error(".align requires one power of two number argument");
  if (imm % 2)
    throw new Error(".align directive requires a power of two.");
  if (imm < 0)
    throw new Error(".align directive cannot align by a negative value.");

  while (state.outIndex % imm) {
    if (state.currentPass === AssemblerPhase.secondPass) {
      state.dataView.setUint8(state.outIndex, 0);
    }

    state.outIndex++;
  }

  return true;
}
