import { IAssemblerState } from "../state";
import { runFunction } from "../functions";
import { throwError } from "../errors";

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
    throwError(".org directive requires one numeric argument", state);
  }

  const imm = runFunction(state.lineExpressions[0], state);
  if (typeof imm !== "number") {
    throwError(`Could not parse .org immediate ${imm}`, state);
    return false;
  }
  if (imm < 0)
    throwError(".org directive cannot be negative", state);

  state.memPos = imm >>> 0; // Better be 32-bit
  return true;
}
