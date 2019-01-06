import { AssemblerPhase } from "../types";
import { IAssemblerState } from "../state";
import { makeNumericExprListRegExp } from "./directiveHelpers";
import { throwError } from "../errors";

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
