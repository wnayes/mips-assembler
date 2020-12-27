import { AssemblerPhase } from "../types";
import { runFunction } from "../functions";
import { throwError } from "../errors";
import { basicDirectiveMatcher } from "./directiveHelpers";
/**
 * .align pads zeroes until the output position is aligned
 * with the specified alignment.
 * @param state Current assembler state.
 */
export default function align(state) {
    if (state.lineExpressions.length !== 1) {
        throwError(".align requires one power of two number argument", state);
    }
    var imm = runFunction(state.lineExpressions[0], state);
    if (imm === null)
        throwError("Could not parse .align immediate " + state.lineExpressions, state);
    if (typeof imm !== "number") {
        throwError(".align requires one power of two number argument", state);
        return false;
    }
    if (imm % 2)
        throwError(".align directive requires a power of two.", state);
    if (imm < 0)
        throwError(".align directive cannot align by a negative value.", state);
    while (state.outIndex % imm) {
        if (state.currentPass === AssemblerPhase.secondPass) {
            state.dataView.setUint8(state.outIndex, 0);
        }
        state.outIndex++;
    }
    return true;
}
align.matches = basicDirectiveMatcher("align");
