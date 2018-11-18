import { IAssemblerState } from "../types";
import { parseImmediate } from "../immediates";
import { addSymbol, getSymbolValue } from "../symbols";
import { LABEL_REGEX_STR } from "../labels";

const defineLabelRegex = new RegExp(`^\\.definelabel\\s+(${LABEL_REGEX_STR})[\\s,]+([-\\w]+)$`, "i");

/**
 * .definelabel adds a new symbol.
 * @param state Current assembler state.
 */
export default function definelabel(state: IAssemblerState): boolean {
  const results = state.line.match(defineLabelRegex);
  if (results === null)
    return false; // Not .definelabel

  const [, name, value] = results;

  const imm = parseImmediate(value);
  if (imm === null) {
    const symbolValue = getSymbolValue(state, value);
    if (symbolValue === null)
      throw new Error(".definelabel value must be numeric or an alias to another label");

    addSymbol(state, name, symbolValue); // Alias
  }
  else {
    addSymbol(state, name, imm);
  }

  return true; // Symbol added
}
