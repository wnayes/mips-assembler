import { IAssemblerState } from "../state";
import { makeBasicDirectiveRegExp } from "./directiveHelpers";
import { pushStaticLabelStateLevel } from "../symbols";

const regexBeginFile = makeBasicDirectiveRegExp("beginfile", true);

/**
 * .beginfile
 *
 * @param state Current assembler state.
 */
export default function beginfile(state: IAssemblerState): boolean {
  if (!state.line.match(regexBeginFile)) {
    return false;
  }

  if (state.lineExpressions.length)
    throw new Error("The beginfile directive takes no arguments");

  pushStaticLabelStateLevel(state);

  return true;
}
