import { IAssemblerState, AssemblerPhase } from "../types";
import { parseImmediate } from "../immediates";

const alignRegex = /^\.align\s+([-\w]+)$/i;

/**
 * .align pads zeroes until the output position is aligned
 * with the specified alignment.
 * @param state Current assembler state.
 */
export default function align(state: IAssemblerState): boolean {
  const results = state.line.match(alignRegex);
  if (results === null)
    return false; // Not .align

  const [, immString] = results;
  const imm = parseImmediate(immString);
  if (imm === null)
    throw new Error(`Could not parse .align immediate ${immString}`);
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
