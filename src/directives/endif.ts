import { IAssemblerState } from "../state";
import { makeBasicDirectiveRegExp } from "./directiveHelpers";

const regexEndIf = makeBasicDirectiveRegExp("endif", true);

/**
 * .endif
 * Ends the last open if or else block.
 *
 * @param state Current assembler state.
 */
export default function endif(state: IAssemblerState): boolean {
  if (!state.line.match(regexEndIf)) {
    return false;
  }

  if (state.lineExpressions.length)
    throw new Error("The endif directive cannot take a condition or parameters");

  if (!state.ifElseStack.length)
    throw new Error("An endif directive was reached, but there was no previous if directive");

  state.ifElseStack.pop();

  return true;
}
