import { IAssemblerState } from "../types";
import { parseImmediate } from "../immediates";

const orgRegex = /^\.org\s+(\w+)$/i;

/**
 * .org changes the effective memory position.
 * @param state Current assembler state.
 */
export default function orga(state: IAssemblerState): boolean {
  const results = state.line.match(orgRegex);
  if (results === null)
    return false; // Not .org

  const [, loc] = results;
  const imm = parseImmediate(loc);
  if (imm === null)
    throw new Error(`Could not parse .org immediate ${loc}`);

  state.memPos = imm >>> 0; // Better be 32-bit
  return true;
}
