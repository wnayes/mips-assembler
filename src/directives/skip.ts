import { IAssemblerState } from "../state";
import { runFunction } from "../functions";

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
    throw new Error(".skip directive requires one numeric argument");
  }

  const imm = runFunction(state.lineExpressions[0], state);
  if (typeof imm !== "number")
    throw new Error(`Could not parse .skip immediate ${imm}`);
  if (imm < 0)
    throw new Error(".skip directive cannot skip a negative length.");

  state.outIndex += imm;
  return true;
}
