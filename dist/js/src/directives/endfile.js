import { basicDirectiveMatcher } from "./directiveHelpers";
import { popStaticLabelStateLevel } from "../symbols";
import { throwError } from "../errors";
/**
 * .endfile
 *
 * @param state Current assembler state.
 */
export default function beginfile(state) {
    if (state.lineExpressions.length)
        throwError("The endfile directive takes no arguments", state);
    popStaticLabelStateLevel(state);
    return true;
}
beginfile.matches = basicDirectiveMatcher("endfile", true);
