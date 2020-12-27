import { basicDirectiveMatcher } from "./directiveHelpers";
import { pushStaticLabelStateLevel } from "../symbols";
import { throwError } from "../errors";
/**
 * .beginfile
 *
 * @param state Current assembler state.
 */
export default function beginfile(state) {
    if (state.lineExpressions.length)
        throwError("The beginfile directive takes no arguments", state);
    pushStaticLabelStateLevel(state);
    return true;
}
beginfile.matches = basicDirectiveMatcher("beginfile", true);
