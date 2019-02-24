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

    if (state.evaluatedLineExpressions.some(v => typeof v !== "number")) {
      throwError(".byte directive requires numeric arguments", state);
    }

    const numbers = state.evaluatedLineExpressions as number[];
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] < 0)
        state.dataView.setInt8(state.outIndex + i, numbers[i]);
      else
        state.dataView.setUint8(state.outIndex + i, numbers[i]);
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
