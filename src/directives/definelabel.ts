import { IAssemblerState } from "../state";
import { addSymbol } from "../symbols";
import { LABEL_REGEX_STR, LABEL_CHARS } from "../labels";
import { runFunction } from "../functions";

const defineLabelRegex = new RegExp(
  `^\\.definelabel\\s+(${LABEL_REGEX_STR})[\\s,]+([-\\w${LABEL_CHARS}]+)$`,
  "i"
);

/**
 * .definelabel adds a new symbol.
 * @param state Current assembler state.
 */
export default function definelabel(state: IAssemblerState): boolean {
  const results = state.line.match(defineLabelRegex);
  if (results === null)
    return false; // Not .definelabel

  if (state.lineExpressions.length !== 2) {
    throw new Error(".definelabel must have two arguments, a label name and value");
  }

  const name = state.lineExpressions[0];
  const value = runFunction(state.lineExpressions[1], state);

  if (typeof value !== "number") {
    throw new Error("The value in .definelabel must evaluate to a numeric value");
  }

  addSymbol(state, name, value);

  return true; // Symbol added
}
