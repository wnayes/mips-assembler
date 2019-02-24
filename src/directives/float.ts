import { AssemblerPhase } from "../types";
import { IAssemblerState } from "../state";
import { throwError } from "../errors";
import { basicDirectiveMatcher } from "./directiveHelpers";

/**
 * Writes 32-bit float values.
 * .float value[,...]
 * @param state Current assembler state.
 */
export default function float(state: IAssemblerState): boolean {
  if (state.currentPass === AssemblerPhase.secondPass) {
    if (!state.evaluatedLineExpressions.length) {
      throwError(".float directive requires arguments", state);
    }

    if (state.evaluatedLineExpressions.some(v => typeof v !== "number")) {
      throwError(".float directive requires numeric arguments", state);
    }

    const numbers = state.evaluatedLineExpressions as number[];
    for (let i = 0; i < numbers.length; i++) {
      state.dataView.setFloat32(state.outIndex + (i * 4), numbers[i]);
    }
  }

  state.outIndex += 4 * state.lineExpressions.length;

  return true;
}
float.matches = basicDirectiveMatcher("float");
