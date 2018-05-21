import { IAssemblerState, AssemblerPhase } from "../types";
import { parseImmediate } from "../immediates";

const regex = /^\.skip\s+([-\w]+)$/i;

/**
 * .skip passes over a given amout of bytes without overwriting them.
 * @param state Current assembler state.
 */
export default function skip(state: IAssemblerState): boolean {
  const results = state.line.match(regex);
  if (results === null)
    return false;

  const [, immString] = results;
  let imm = parseImmediate(immString);
  if (imm === null)
    throw new Error(`Could not parse .skip immediate ${immString}`);
  if (imm < 0)
    throw new Error(".skip directive cannot skip a negative length.");

  state.outIndex += imm
  return true;
}
