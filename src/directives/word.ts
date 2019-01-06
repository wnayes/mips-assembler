import { AssemblerPhase } from "../types";
import { IAssemblerState } from "../state";
import { makeNumericExprListRegExp } from "./directiveHelpers";
import { throwError } from "../errors";

const regexWord = makeNumericExprListRegExp("word");
const regexDw = makeNumericExprListRegExp("dw");

/**
 * Writes 32-bit values.
 * .word value[,...]
 * .dw value[,...]
 * @param state Current assembler state.
 */
export default function word(state: IAssemblerState): boolean {
  let results = state.line.match(regexWord);
  if (!results) {
    results = state.line.match(regexDw);
    if (!results)
      return false;
  }

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
