import { IAssemblerState } from "../types";
import { parseImmediate } from "../immediates";
import { runFunction } from "../functions";

const orgaRegex = /^\.orga\s+/i;

/**
 * .orga updates the current output buffer index.
 * @param state Current assembler state.
 */
export default function orga(state: IAssemblerState): boolean {
  const results = state.line.match(orgaRegex);
  if (results === null)
    return false; // Not .orga

  if (state.lineExpressions.length !== 1) {
    throw new Error(".orga directive requires one numeric argument");
  }

  const imm = runFunction(state.lineExpressions[0], state);
  if (typeof imm !== "number")
    throw new Error(`Could not parse .orga immediate ${imm}`);
  if (imm < 0)
    throw new Error(".orga directive cannot be negative.");

  state.outIndex = imm >>> 0; // Better be 32-bit
  return true;
}
