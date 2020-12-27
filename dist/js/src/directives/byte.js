import { AssemblerPhase } from "../types";
import { basicDirectiveMatcher } from "./directiveHelpers";
import { throwError } from "../errors";
/**
 * .byte value[,...]
 * .db value[,...]
 * @param state Current assembler state.
 */
export default function byte(state) {
    if (state.currentPass === AssemblerPhase.secondPass) {
        if (!state.evaluatedLineExpressions.length) {
            throwError(".byte directive requires arguments", state);
        }
        var numbers = state.evaluatedLineExpressions;
        for (var i = 0; i < numbers.length; i++) {
            var num = numbers[i];
            if (typeof num !== "number") {
                throwError(".byte directive requires numeric arguments, saw: " + num, state);
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
var byteMatcher = basicDirectiveMatcher("byte");
var dbMatcher = basicDirectiveMatcher("db");
byte.matches = function (state) {
    return byteMatcher(state) || dbMatcher(state);
};
