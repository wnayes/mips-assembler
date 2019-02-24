import { IAssemblerState } from "../state";
import { addSymbol } from "../symbols";
import { LABEL_REGEX_STR, LABEL_CHARS } from "../labels";
import { runFunction } from "../functions";
import { throwError } from "../errors";

/**
 * .definelabel adds a new symbol.
 * @param state Current assembler state.
 */
export default function definelabel(state: IAssemblerState): boolean {
  if (state.lineExpressions.length !== 2) {
    throwError(".definelabel must have two arguments, a label name and value", state);
  }

  const name = state.lineExpressions[0];
  const value = runFunction(state.lineExpressions[1], state);

  if (typeof value !== "number") {
    throwError("The value in .definelabel must evaluate to a numeric value", state);
    return false;
  }

  addSymbol(state, name, value);

  return true; // Symbol added
}

const defineLabelRegex = new RegExp(
  `^\\.definelabel\\s+(${LABEL_REGEX_STR})[\\s,]+([-\\w${LABEL_CHARS}]+)$`,
  "i"
);

definelabel.matches = (state: IAssemblerState) => {
  const results = state.line.match(defineLabelRegex);
  return results !== null;
};
