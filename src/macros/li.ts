import { IAssemblerState } from "../state";
import { basicMacroMatcher } from "./macroHelpers";
import { AssemblerPhase } from "../types";
import { throwError } from "../errors";
import { runFunction } from "../functions";

/**
 * li dest,value
 *
 * @param state Current assembler state.
 */
export default function li(state: IAssemblerState): void {
  if (state.currentPass !== AssemblerPhase.firstPass) {
    throwError("The `li` macro shouldn't be present after the first assembly phase", state);
    return;
  }

  if (state.lineExpressions.length <= 1)
    throwError("The `li` macro must take a register and immediate", state);

  const dest = state.lineExpressions[0];
  const value = runFunction(state.lineExpressions[1], state);
  if (value === null) {
    // Most likely a label is not yet defined in the first pass.
    // We can try to salvage this situation with "worst case" handling.
    state.line = ""; // Delete this line.
    state.linesToInsert =
`LUI ${dest}, hi(${state.lineExpressions[1]})
ADDIU ${dest}, ${dest}, lo(${state.lineExpressions[1]})`;
    return;
  }
  if (typeof value !== "number") {
    throwError("Immediate value of `li` macro must evaluate to a number, saw: " + value, state);
    return;
  }

  state.line = ""; // Delete this line.

  if (value >= -32768 && value <= 32767) {
    state.linesToInsert = `ADDIU ${dest}, R0, ${value}`;
  }
  else if (value > 0 && value <= 65535) {
    state.linesToInsert = `ORI ${dest}, R0, ${value}`;
  }
  else if ((value & 0xFFFF) === 0) {
    state.linesToInsert = `LUI ${dest}, ${value >> 16}`;
  }
  else if (value >= -0xFFFFFFFF && value <= 0xFFFEFFFF) {
    const needsSignAdjust = (value & 0x8000) !== 0;
    state.linesToInsert =
`LUI ${dest}, ${(value >>> 16) + (needsSignAdjust ? 1 : 0)}
ADDIU ${dest}, ${dest}, ${value & 0xFFFF}`;
  }
  else {
    throwError(`li immediate value ${value} seems out of range`, state);
  }
}
li.matches = basicMacroMatcher("li");
