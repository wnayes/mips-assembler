import { isLocalLabel, isStaticLabel } from "./labels";
import { AssemblerPhase } from "./types";
import { throwError } from "./errors";
/**
 * Adds a symbol to the symbol table.
 * @param state Assembler state
 * @param name Symbol name
 * @param value Symbol value
 */
export function addSymbol(state, name, value) {
    if (isLocalLabel(name)) {
        if (!state.currentLabel) {
            throwError("Local label " + name + " (starts with @@) cannot be used before a global label", state);
        }
        addLocalSymbol(state, name, value);
    }
    else if (isStaticLabel(name)) {
        addStaticLabel(state, name, value);
    }
    else {
        addGlobalSymbol(state, name, value);
    }
}
/**
 * Adds a global symbol to the symbol table.
 * @param state Assembler state
 * @param name Symbol name
 * @param value Symbol value
 */
export function addGlobalSymbol(state, name, value) {
    state.symbols[name] = value;
    state.symbolsByValue[value] = name;
    if (state.symbolOutputMap) {
        state.symbolOutputMap[name] = state.outIndex;
    }
}
/**
 * Adds a local symbol to the symbol table.
 * @param state Assembler state
 * @param name Local symbol name
 * @param value Local symbol value
 *
 * Assumes !!state.currentLabel
 */
export function addLocalSymbol(state, name, value) {
    var localTable = state.localSymbols[state.currentLabel];
    if (!localTable) {
        localTable = state.localSymbols[state.currentLabel] = Object.create(null);
    }
    localTable[name] = value;
}
export function addStaticLabel(state, name, value) {
    var staticsTable = state.staticSymbols[state.staticSymbols.length - 1];
    staticsTable[name] = value;
}
export function pushStaticLabelStateLevel(state) {
    if (state.currentPass === AssemblerPhase.firstPass) {
        state.staticSymbols.push(Object.create(null));
        var prevIndex = state.staticSymbolIndices[state.staticSymbolIndices.length - 1];
        var newIndex = state.staticSymbols.length - 1;
        state.staticSymbolIndices.before[newIndex] = prevIndex;
        state.staticSymbolIndices.push(newIndex);
    }
    else {
        state.staticSymbolIndices.shift();
    }
}
export function popStaticLabelStateLevel(state) {
    if (state.currentPass === AssemblerPhase.firstPass) {
        var indices = state.staticSymbolIndices;
        indices.push(indices.before[indices[indices.length - 1]]);
    }
    else {
        state.staticSymbolIndices.shift();
    }
}
function getCurrentStaticSymbols(state) {
    if (state.currentPass === AssemblerPhase.firstPass) {
        return state.staticSymbols[state.staticSymbolIndices[state.staticSymbolIndices.length - 1]];
    }
    else {
        return state.staticSymbols[state.staticSymbolIndices[0]];
    }
}
/**
 * Retrieves a symbol by name. Works for all: global, static, or local.
 */
export function getSymbolValue(state, name) {
    if (isLocalLabel(name)) {
        if (!state.currentLabel) {
            throwError("Local label " + name + " cannot be referenced in the current scope", state);
        }
        var localTable = state.localSymbols[state.currentLabel];
        if (localTable && Object.prototype.hasOwnProperty.call(localTable, name)) {
            return localTable[name];
        }
        return null;
    }
    if (isStaticLabel(name)) {
        var staticTable = getCurrentStaticSymbols(state);
        if (Object.prototype.hasOwnProperty.call(staticTable, name)) {
            return staticTable[name];
        }
        return null;
    }
    if (Object.prototype.hasOwnProperty.call(state.symbols, name)) {
        return state.symbols[name];
    }
    return null;
}
/**
 * Retrieves a symbol by value from the symbol table.
 * Does not retrieve local labels.
 * TODO: Should do static labels too.
 */
export function getSymbolByValue(state, value) {
    // Don't need hasOwnProperty check here, all values in key->value should be truthy strings.
    return state.symbolsByValue[value] || null;
}
