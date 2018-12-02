import { IAssemblerState } from "../types";
import { makeBasicDirectiveRegExp } from "./directiveHelpers";
import { runFunction } from "../functions";
import { setIfElseBlockState, IfElseStateFlags, IfElseBlockStateMask  } from "../conditionals";

const regexElseIf = makeBasicDirectiveRegExp("elseif");

/**
 * .elseif cond
 *
 * `cond` is met if it evaluates to a non-zero integer.
 *
 * @param state Current assembler state.
 */
export default function elseif(state: IAssemblerState): boolean {
  if (!state.line.match(regexElseIf)) {
    return false;
  }

  if (!state.lineExpressions.length)
    throw new Error("A condition must be passed to an elseif directive");
  if (state.lineExpressions.length > 1)
    throw new Error("Only a single condition can be passed to an elseif directive");
  if (!state.ifElseStack.length)
    throw new Error("An elseif directive was reached, but there was no previous if directive");

  const curState = state.ifElseStack[state.ifElseStack.length - 1];
  if (curState & IfElseStateFlags.SawElse)
    throw new Error("Encountered an elseif after seeing an else directive");

  const value = runFunction(state.lineExpressions[0], state);
  if (value === null)
    throw new Error("Could not parse .elseif condition");
  if (typeof value !== "number")
    throw new Error("Condition of elseif directive must evaluate to a numeric value, saw: " + value);

  switch (curState & IfElseBlockStateMask) {
    case IfElseStateFlags.AcceptingBlock:
      if (value) {
        setIfElseBlockState(state, IfElseStateFlags.ExecutingBlock);
      }
      break;

    case IfElseStateFlags.ExecutingBlock:
      setIfElseBlockState(state, IfElseStateFlags.NoLongerAcceptingBlock);
      break;

    case IfElseStateFlags.NoLongerAcceptingBlock:
      break;

    default:
      throw new Error("Unexpected conditional block state: " + curState.toString(16));
  }

  return true;
}
