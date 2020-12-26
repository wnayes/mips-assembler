import { AssemblerPhase } from "../types";
import { IAssemblerState } from "../state";
import { basicDirectiveMatcher } from "./directiveHelpers";
import { throwError } from "../errors";

/**
 * .byte value[,...]
 * .db value[,...]
 * @param state Current assembler state.
 */
export default function byte(state: IAssemblerState): boolean {
  if (state.currentPass === AssemblerPhase.secondPass) {
    if (!state.evaluatedLineExpressions.length) {
      throwError(".byte directive requires arguments", state);
    }

    const numbers = state.evaluatedLineExpressions;
    for (let i = 0; i < numbers.length; i++) {
      const num = numbers[i];
      if (typeof num !== "number") {
        throwError(`.byte directive requires numeric arguments, saw: ${num}`, state);
      }

      if (num < 0)
        state.dataView.setInt8(state.outIndex + i, num);
      else
        state.dataView.setUint8(state.outIndex + i, num);
    }
  }

  state.outIndex += state.lineExpressions.length;

  return true;
}

const byteMatcher = basicDirectiveMatcher("byte");
const dbMatcher = basicDirectiveMatcher("db");

byte.matches = (state: IAssemblerState) => {
  return byteMatcher(state) || dbMatcher(state);
};
