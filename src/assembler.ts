import { parse, print } from "mips-inst";

import { IAssemblerState, AssemblerPhase } from "./types";
import { handleDirective } from "./directives";
import { parseGlobalLabel } from "./labels";
import { getSymbolByValue } from "./symbols";
import { evaluateExpressionsOnCurrentLine, parseExpressionsOnCurrentLine } from "./expressions";

/**
 * Optional parameters used to configure assembly.
 */
export interface IAssembleOpts {
  /**
   * When passed, the assembly will be performed against this buffer.
   * By default, the assembler will produce a new buffer for you.
   * Many directives only make sense when passing this buffer
   * (like .orga)
   */
  buffer?: ArrayBuffer;

  /**
   * If true, return an array of text instructions instead of a buffer.
   * This is useful for debugging.
   */
  text?: boolean;
}

/**
 * Assembles the given input instructions.
 * @param input
 * @param opts
 */
export function assemble(input: string | string[], opts?: IAssembleOpts): ArrayBuffer | string[] {
  opts = opts || {};

  let arr = _ensureArray(input);
  arr = arr.filter(s => { return typeof s === "string" });
  arr = _stripComments(arr);
  arr = arr.map(s => { return s.trim(); });
  arr = arr.filter(Boolean);

  const state = _makeNewAssemblerState();

  const outStrs: string[] = [];

  // First pass, calculate label positions.
  arr = arr.map(line => {
    state.line = line;

    if (line[0] === ".") {
      parseExpressionsOnCurrentLine(state);
      handleDirective(state);
      return line; // Keep directives for second pass.
    }

    let parsedLabel: string | boolean;
    while (parsedLabel = parseGlobalLabel(state)) {
      state.line = line = line.substr(parsedLabel.length + 1).trim();
    }

    // If !line, then only labels were on the line.
    if (line) {
      state.outIndex += 4;
    }

    return line;
  });

  // Re-filter out empty lines.
  arr = arr.filter(Boolean);

  state.buffer = opts.buffer || new ArrayBuffer(state.outIndex);
  state.dataView = new DataView(state.buffer);

  state.memPos = 0;
  state.outIndex = 0;
  state.currentPass = AssemblerPhase.secondPass;

  // Second pass, assemble!
  arr.forEach(line => {
    state.line = line;
    state.lineExpressions = [];
    state.evaluatedLineExpressions = [];

    if (line[0] === ".") {
      evaluateExpressionsOnCurrentLine(state);
      handleDirective(state);
      return;
    }

    // Start a new "area" if we hit a global symbol boundary.
    const globalSymbol = getSymbolByValue(state, state.memPos + state.outIndex);
    if (globalSymbol !== null) {
      state.currentLabel = globalSymbol;
    }

    // Apply any built-in functions, symbols.
    line = state.line = evaluateExpressionsOnCurrentLine(state);

    if (opts!.text)
      outStrs.push(line);

    // At this point, we should be able to parse the instruction.
    const inst = parse(line);
    state.dataView!.setUint32(state.outIndex, inst);

    state.outIndex += 4;
  });

  if (opts.text)
    return outStrs;

  return state.buffer;
}

/** Strips single line ; or // comments. */
function _stripComments(input: string[]): string[] {
  return input.map(line => {
    const semicolonIndex = line.indexOf(";");
    const slashesIndex = line.indexOf("//");
    if (semicolonIndex === -1 && slashesIndex === -1)
      return line; // No comments

    let removalIndex = semicolonIndex;
    if (removalIndex === -1)
      removalIndex = slashesIndex;
    else if (slashesIndex !== -1)
      removalIndex = Math.min(semicolonIndex, slashesIndex);

    return line.substr(0, removalIndex);
  });
}

function _makeNewAssemblerState(): IAssemblerState {
  return {
    buffer: null,
    dataView: null,
    line: "",
    memPos: 0,
    outIndex: 0,
    symbols: Object.create(null),
    symbolsByValue: Object.create(null),
    currentLabel: null,
    localSymbols: Object.create(null),
    currentPass: AssemblerPhase.firstPass,
    lineExpressions: [],
    evaluatedLineExpressions: null,
  };
}

function _ensureArray(input: string | string[]): string[] {
  if (typeof input === "string")
    return input.split(/\r?\n/);

  if (!Array.isArray(input))
    throw new Error("Input must be a string or array of strings");

  return input;
}