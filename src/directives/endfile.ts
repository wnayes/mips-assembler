import { IAssemblerState } from "../state";
import { makeBasicDirectiveRegExp } from "./directiveHelpers";
import { popStaticLabelStateLevel } from "../symbols";
import { throwError } from "../errors";

const regexEndFile = makeBasicDirectiveRegExp("endfile", true);

/**
 * .endfile
 *
 * @param state Current assembler state.
 */
export default function beginfile(state: IAssemblerState): boolean {
  if (!state.line.match(regexEndFile)) {
    return false;
  }

  if (state.lineExpressions.length)
    throwError("The endfile directive takes no arguments", state);

  popStaticLabelStateLevel(state);

  return true;
}
