import { IAssemblerState } from "../state";
import { runFunction } from "../functions";
import { throwError } from "../errors";

const regex = /^\.skip\s+/i;

/**
 * .skip passes over a given amout of bytes without overwriting them.
 * @param state Current assembler state.
 */
export default function skip(state: IAssemblerState): boolean {
  const results = state.line.match(regex);
  if (results === null)
    return false;

  if (state.lineExpressions.length !== 1) {
    throwError(".skip directive requires one numeric argument", state);
  }

  const imm = runFunction(state.lineExpressions[0], state);
  if (typeof imm !== "number") {
    throwError(`Could not parse .skip immediate ${imm}`, state);
    return false;
  }
  if (imm < 0)
    throwError(".skip directive cannot skip a negative length.", state);

  state.outIndex += imm;
  return true;
}
