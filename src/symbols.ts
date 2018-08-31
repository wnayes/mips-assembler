import { IAssemblerState } from "./types";
import { isLocalLabel } from "./labels";

/**
 * Adds a symbol to the symbol table.
 * @param state Assembler state
 * @param name Symbol name
 * @param value Symbol value
 */
export function addSymbol(state: IAssemblerState, name: string, value: number): void {
  state.symbols[name] = value;
  state.symbolsByValue[value] = name;
}

/**
 * Adds a local symbol to the symbol table.
 * @param state Assembler state
 * @param name Local symbol name
 * @param value Local symbol value
 *
 * Assumes !!state.currentLabel
 */
export function addLocalSymbol(state: IAssemblerState, name: string, value: number): void {
  let localTable = state.localSymbols[state.currentLabel];
  if (!localTable) {
    localTable = state.localSymbols[state.currentLabel] = Object.create(null);
  }
  localTable[name] = value;
}

/**
 * Retrieves a symbol by name, global or local.
 */
export function getSymbolValue(state: IAssemblerState, name: string): number | null {
  if (isLocalLabel(name)) {
    if (!state.currentLabel) {
      throw new Error(`Local label ${name} cannot be referenced in the current scope`);
    }

    const localTable = state.localSymbols[state.currentLabel];
    if (localTable) {
      return localTable[name] || null;
    }
    return null;
  }

  return state.symbols[name] || null;
}

/**
 * Retrieves a symbol by value from the symbol table.
 * Does not retrieve local labels.
 */
export function getSymbolByValue(state: IAssemblerState, value: number): string | null {
  return state.symbolsByValue[value] || null;
}
