import { AssemblerPhase } from "../types";
import { basicDirectiveMatcher } from "./directiveHelpers";
import { throwError } from "../errors";
/**
 * Writes 32-bit values.
 * .word value[,...]
 * .dw value[,...]
 * @param state Current assembler state.
 */
export default function word(state) {
    if (state.currentPass === AssemblerPhase.secondPass) {
        if (!state.evaluatedLineExpressions.length) {
            throwError(".word directive requires arguments", state);
        }
        var numbers = state.evaluatedLineExpressions;
        for (var i = 0; i < numbers.length; i++) {
            var num = numbers[i];
            if (typeof num !== "number") {
                throwError(".word directive requires numeric arguments, saw: " + num, state);
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
var wMatcher = basicDirectiveMatcher("word");
var dwMatcher = basicDirectiveMatcher("dw");
word.matches = function (state) {
    return wMatcher(state) || dwMatcher(state);
};
