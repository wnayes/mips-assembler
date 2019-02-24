import { AssemblerPhase } from "../types";
import { IAssemblerState } from "../state";
import { basicDirectiveMatcher } from "./directiveHelpers";
import { throwError } from "../errors";

/**
 * Writes 16-bit values.
 * .halfword value[,...]
 * .dh value[,...]
 * @param state Current assembler state.
 */
export default function halfword(state: IAssemblerState): boolean {
  if (state.currentPass === AssemblerPhase.secondPass) {
    if (!state.evaluatedLineExpressions.length) {
      throwError(".halfword directive requires arguments", state);
    }

    if (state.evaluatedLineExpressions.some(v => typeof v !== "number")) {
      throwError(".halfword directive requires numeric arguments", state);
    }

    const numbers = state.evaluatedLineExpressions as number[];
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] < 0)
        state.dataView.setInt16(state.outIndex + (i * 2), numbers[i]);
      else
        state.dataView.setUint16(state.outIndex + (i * 2), numbers[i]);
    }
  }

  state.outIndex += 2 * state.lineExpressions.length;

  return true;
}

const hwMatcher = basicDirectiveMatcher("halfword");
const dhMatcher = basicDirectiveMatcher("dh");

halfword.matches = (state: IAssemblerState) => {
  return hwMatcher(state) || dhMatcher(state);
};
