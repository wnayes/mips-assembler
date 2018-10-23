import { parse, print } from "mips-inst";

import { IAssemblerState, AssemblerPhase } from "./types";
import { handleDirective } from "./directives";
import { runFunction } from "./functions";
import { parseImmediate } from "./immediates";
import { parseGlobalLabel } from "./labels";
import { getSymbolByValue } from "./symbols";

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

    if (line[0] === ".") {
      line = evaluateExpressionsOnCurrentLine(state);
      handleDirective(state);
      return;
    }

    // Start a new "area" if we hit a global symbol boundary.
    const globalSymbol = getSymbolByValue(state, state.memPos + state.outIndex);
    if (globalSymbol !== null) {
      state.currentLabel = globalSymbol;
    }

    // Apply any built-in functions, symbols.
    line = evaluateExpressionsOnCurrentLine(state);

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

function evaluateExpressionsOnCurrentLine(state: IAssemblerState) {
  let line = state.line;
  const instPieces = line.split(/[,\s]+/g);
  if (instPieces.length > 1) {
    let lastPiece = runFunction(instPieces[instPieces.length - 1], state);
    if (lastPiece !== null) {
      lastPiece = _fixBranch(instPieces[0], lastPiece, state);
      instPieces[instPieces.length - 1] = lastPiece;
      line = state.line = instPieces.join(" ");
    }
  }
  return line;
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

/** Transforms branches from absolute to relative. */
function _fixBranch(inst: string, offset: string, state: IAssemblerState): string {
  if (_instIsBranch(inst)) {
    const imm = parseImmediate(offset)!; // Should definitely succeed.
    const memOffset = state.memPos + state.outIndex;
    const diff = ((imm - memOffset) / 4) - 1;
    return diff.toString(); // base 10 ok
  }

  return offset; // Leave as is.
}

function _instIsBranch(inst: string): boolean {
  inst = inst.toLowerCase();
  if (inst[0] !== "b")
    return false;

  switch (inst) {
    case "bc1f":
    case "bc1fl":
    case "bc1t":
    case "bc1tl":
    case "beq":
    case "beql":
    case "bgez":
    case "bgezal":
    case "bgezall":
    case "bgezl":
    case "bgtz":
    case "bgtzl":
    case "blez":
    case "blezl":
    case "bltz":
    case "bltzal":
    case "bltzall":
    case "bltzl":
    case "bne":
    case "bnel":
      return true;
  }
  return false;
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
  };
}

function _ensureArray(input: string | string[]): string[] {
  if (typeof input === "string")
    return input.split(/\r?\n/);

  if (!Array.isArray(input))
    throw new Error("Input must be a string or array of strings");

  return input;
}