import { IAssemblerState } from "../types";
import { parseImmediate } from "../immediates";

const defineLabelRegex = /^\.definelabel\s+(\w+)[\s,]+(\w+)$/i;

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
    if (!state.symbols[value])
      throw new Error(".definelabel value must be numeric or an alias to another label");

    state.symbols[name] = state.symbols[value]; // Alias
  }
  else {
    state.symbols[name] = imm;
  }

  return true; // Symbol added
}
