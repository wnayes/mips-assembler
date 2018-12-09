import { IAssemblerState } from "../state";
import { makeBasicDirectiveRegExp } from "./directiveHelpers";
import { setIfElseBlockState, IfElseStateFlags, IfElseBlockStateMask } from "../conditionals";

const regexElse = makeBasicDirectiveRegExp("else", true);

/**
 * .else
 *
 * @param state Current assembler state.
 */
export default function elseblock(state: IAssemblerState): boolean {
  if (!state.line.match(regexElse)) {
    return false;
  }

  if (state.lineExpressions.length)
    throw new Error("The else directive cannot take a condition or parameters");

  if (!state.ifElseStack.length)
    throw new Error("An else directive was reached, but there was no previous if directive");

  const curState = state.ifElseStack[state.ifElseStack.length - 1];
  if (curState & IfElseStateFlags.SawElse)
    throw new Error("Encountered another else directive, but an else directive was already passed");

  switch (curState & IfElseBlockStateMask) {
    case IfElseStateFlags.AcceptingBlock:
      setIfElseBlockState(state, IfElseStateFlags.ExecutingBlock);
      break;

    case IfElseStateFlags.ExecutingBlock:
      setIfElseBlockState(state, IfElseStateFlags.NoLongerAcceptingBlock);
      break;

    case IfElseStateFlags.NoLongerAcceptingBlock:
      break;

    default:
      throw new Error("Unexpected conditional block state: " + curState.toString(16));
  }

  state.ifElseStack[state.ifElseStack.length - 1] |= IfElseStateFlags.SawElse;

  return true;
}
