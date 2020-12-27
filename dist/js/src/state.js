import { AssemblerPhase } from "./types";
export function makeNewAssemblerState(opts) {
    var staticSymbolIndices = [0];
    staticSymbolIndices.before = Object.create(null);
    return {
        buffer: null,
        dataView: null,
        line: "",
        memPos: 0,
        outIndex: 0,
        symbols: Object.create(null),
        symbolsByValue: Object.create(null),
        symbolOutputMap: opts.symbolOutputMap,
        currentLabel: null,
        localSymbols: Object.create(null),
        staticSymbols: [Object.create(null)],
        staticSymbolIndices: staticSymbolIndices,
        currentPass: AssemblerPhase.firstPass,
        lineExpressions: [],
        evaluatedLineExpressions: null,
        ifElseStack: [],
        files: opts.files || Object.create(null),
        linesToInsert: null,
    };
}
