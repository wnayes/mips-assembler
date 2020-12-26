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

    const numbers = state.evaluatedLineExpressions;
    for (let i = 0; i < numbers.length; i++) {
      const num = numbers[i];
      if (typeof num !== "number") {
        throwError(`.word directive requires numeric arguments, saw: ${num}`, state);
      }

      if (num < 0)
        state.dataView.setInt32(state.outIndex + (i * 4), num);
      else
        state.dataView.setUint32(state.outIndex + (i * 4), num);
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
