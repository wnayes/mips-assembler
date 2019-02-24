import { IAssemblerState } from "../state";
import { basicDirectiveMatcher } from "./directiveHelpers";
import { pushStaticLabelStateLevel } from "../symbols";
import { throwError } from "../errors";

/**
 * .beginfile
 *
 * @param state Current assembler state.
 */
export default function beginfile(state: IAssemblerState): boolean {
  if (state.lineExpressions.length)
    throwError("The beginfile directive takes no arguments", state);

  pushStaticLabelStateLevel(state);

  return true;
}
beginfile.matches = basicDirectiveMatcher("beginfile", true);
