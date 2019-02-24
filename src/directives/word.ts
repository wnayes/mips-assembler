import { AssemblerPhase } from "../types";
import { IAssemblerState } from "../state";
import { basicDirectiveMatcher } from "./directiveHelpers";
import { throwError } from "../errors";

/**
 * Writes 32-bit values.
 * .word value[,...]
 * .dw value[,...]
 * @param state Current assembler state.
 */
export default function word(state: IAssemblerState): boolean {
  if (state.currentPass === AssemblerPhase.secondPass) {
    if (!state.evaluatedLineExpressions.length) {
      throwError(".word directive requires arguments", state);
    }

    if (state.evaluatedLineExpressions.some(v => typeof v !== "number")) {
      throwError(".word directive requires numeric arguments", state);
    }

    const numbers = state.evaluatedLineExpressions as number[];
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] < 0)
        state.dataView.setInt32(state.outIndex + (i * 4), numbers[i]);
      else
        state.dataView.setUint32(state.outIndex + (i * 4), numbers[i]);
    }
  }

  state.outIndex += 4 * state.lineExpressions.length;

  return true;
}

const wMatcher = basicDirectiveMatcher("word");
const dwMatcher = basicDirectiveMatcher("dw");

word.matches = (state: IAssemblerState) => {
  return wMatcher(state) || dwMatcher(state);
};
