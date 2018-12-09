import { IAssemblerState } from "../state";
import { makeBasicDirectiveRegExp } from "./directiveHelpers";
import { popStaticLabelStateLevel } from "../symbols";

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
    throw new Error("The endfile directive takes no arguments");

  popStaticLabelStateLevel(state);

  return true;
}
