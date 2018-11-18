import { IAssemblerState, AssemblerPhase } from "../types";
import { makeNumericExprListRegExp } from "./directiveHelpers";

const regexByte = makeNumericExprListRegExp("byte");
const regexDb = makeNumericExprListRegExp("db");

/**
 * .byte value[,...]
 * .db value[,...]
 * @param state Current assembler state.
 */
export default function byte(state: IAssemblerState): boolean {
  let results = state.line.match(regexByte);
  if (!results) {
    results = state.line.match(regexDb);
    if (!results)
      return false;
  }

  if (state.currentPass === AssemblerPhase.secondPass) {
    if (!state.evaluatedLineExpressions.length) {
      throw new Error(".byte directive requires arguments");
    }

    if (state.evaluatedLineExpressions.some(v => typeof v !== "number")) {
      throw new Error(".byte directive requires numeric arguments");
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
