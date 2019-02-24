import { IAssemblerState } from "../state";
import { runFunction } from "../functions";
import { basicDirectiveMatcher } from "./directiveHelpers";
import { IfElseStateFlags } from "../conditionals";
import { throwError } from "../errors";

/**
 * .if cond
 *
 * `cond` is met if it evaluates to a non-zero integer.
 *
 * @param state Current assembler state.
 */
export default function ifcond(state: IAssemblerState): boolean {
  if (!state.lineExpressions.length)
    throwError("A condition must be passed to an if directive", state);
  if (state.lineExpressions.length > 1)
    throwError("Only a single condition can be passed to an if directive", state);

  const value = runFunction(state.lineExpressions[0], state);
  if (value === null)
    throwError("Could not parse .if condition", state);
  if (typeof value !== "number")
    throwError("Condition of if directive must evaluate to a numeric value, saw: " + value, state);

  if (value) {
    state.ifElseStack.push(IfElseStateFlags.ExecutingBlock);
  }
  else {
    state.ifElseStack.push(IfElseStateFlags.AcceptingBlock);
  }

  return true;
}
ifcond.matches = basicDirectiveMatcher("if");