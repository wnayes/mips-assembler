import { IAssemblerState, AssemblerPhase } from "../types";
import { makeNumericExprListRegExp } from "./directiveHelpers";

const regexHalfword = makeNumericExprListRegExp("halfword");
const regexDh = makeNumericExprListRegExp("dh");

/**
 * Writes 16-bit values.
 * .halfword value[,...]
 * .dh value[,...]
 * @param state Current assembler state.
 */
export default function halfword(state: IAssemblerState): boolean {
  let results = state.line.match(regexHalfword);
  if (!results) {
    results = state.line.match(regexDh);
    if (!results)
      return false;
  }

  if (state.currentPass === AssemblerPhase.secondPass) {
    if (!state.evaluatedLineExpressions.length) {
      throw new Error(".halfword directive requires arguments");
    }

    if (state.evaluatedLineExpressions.some(v => typeof v !== "number")) {
      throw new Error(".halfword directive requires numeric arguments");
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
