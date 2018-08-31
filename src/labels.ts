import { IAssemblerState } from "./types";
import { addSymbol, addLocalSymbol } from "./symbols";

/**
 * Parses a LABEL: expression and adds it to the symbol table.
 * Examples of valid labels:
 *    basicLabel:    excited!Label!:    mystery?Label?:
 *    @@localLabel:  12345:             !?!:
 */
export function parseGlobalLabel(state: IAssemblerState): string | false {
  const labelRegex = /^((?:@@)?[\w\?\!]+)\:/;
  const results = state.line.match(labelRegex);
  if (results === null)
    return false; // Not a label.

  const [, name] = results;
  if (isLocalLabel(name)) {
    if (!state.currentLabel) {
      throw new Error(`Local label ${name} (starts with @@) cannot be used before a global label`);
    }

    addLocalSymbol(state, name, getLabelValueFromState(state));
  }
  else {
    state.currentLabel = name;
    addSymbol(state, name, getLabelValueFromState(state));
  }

  return name;
}

export function isLocalLabel(name: string): boolean {
  return name.indexOf("@@") === 0;
}

function getLabelValueFromState(state: IAssemblerState): number {
  return (state.memPos + state.outIndex) >>> 0;
}