import { IAssemblerState } from "../state";
import { runFunction } from "../functions";

const orgRegex = /^\.org\s+/i;

/**
 * .org changes the effective memory position.
 * @param state Current assembler state.
 */
export default function orga(state: IAssemblerState): boolean {
  const results = state.line.match(orgRegex);
  if (results === null)
    return false; // Not .org

  if (state.lineExpressions.length !== 1) {
    throw new Error(".org directive requires one numeric argument");
  }

  const imm = runFunction(state.lineExpressions[0], state);
  if (typeof imm !== "number")
    throw new Error(`Could not parse .org immediate ${imm}`);
  if (imm < 0)
    throw new Error(".org directive cannot be negative");

  state.memPos = imm >>> 0; // Better be 32-bit
  return true;
}
