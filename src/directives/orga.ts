import { IAssemblerState } from "../types";
import { parseImmediate } from "../immediates";

const orgaRegex = /^\.orga\s+(\w+)$/i;

/**
 * .orga updates the current output buffer index.
 * @param state Current assembler state.
 */
export default function orga(state: IAssemblerState): boolean {
  const results = state.line.match(orgaRegex);
  if (results === null)
    return false; // Not .orga

  const [, loc] = results;
  const imm = parseImmediate(loc);
  if (imm === null)
    throw new Error(`Could not parse .orga immediate ${loc}`);

  state.outIndex = imm >>> 0; // Better be 32-bit
  return true;
}
