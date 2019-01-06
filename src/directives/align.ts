import { AssemblerPhase } from "../types";
import { IAssemblerState } from "../state";
import { runFunction } from "../functions";
import { throwError } from "../errors";

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
    throwError(".align requires one power of two number argument", state);
  }

  const imm = runFunction(state.lineExpressions[0], state);
  if (imm === null)
    throwError(`Could not parse .align immediate ${state.lineExpressions}`, state);
  if (typeof imm !== "number") {
    throwError(".align requires one power of two number argument", state);
    return false;
  }
  if (imm % 2)
    throwError(".align directive requires a power of two.", state);
  if (imm < 0)
    throwError(".align directive cannot align by a negative value.", state);

  while (state.outIndex % imm) {
    if (state.currentPass === AssemblerPhase.secondPass) {
      state.dataView.setUint8(state.outIndex, 0);
    }

    state.outIndex++;
  }

  return true;
}
