import { IAssemblerState } from "../types";
import { runFunction } from "../functions";
import { makeBasicDirectiveRegExp } from "./directiveHelpers";
import { IfElseStateFlags } from "../conditionals";

const regexIf = makeBasicDirectiveRegExp("if");

/**
 * .if cond
 *
 * `cond` is met if it evaluates to a non-zero integer.
 *
 * @param state Current assembler state.
 */
export default function ifcond(state: IAssemblerState): boolean {
  if (!state.line.match(regexIf)) {
    return false;
  }

  if (!state.lineExpressions.length)
    throw new Error("A condition must be passed to an if directive");
  if (state.lineExpressions.length > 1)
    throw new Error("Only a single condition can be passed to an if directive");

  const value = runFunction(state.lineExpressions[0], state);
  if (value === null)
    throw new Error("Could not parse .if condition");
  if (typeof value !== "number")
    throw new Error("Condition of if directive must evaluate to a numeric value, saw: " + value);

  if (value) {
    state.ifElseStack.push(IfElseStateFlags.ExecutingBlock);
  }
  else {
    state.ifElseStack.push(IfElseStateFlags.AcceptingBlock);
  }

  return true;
}
