import { parse, print } from "mips-inst";

import { IAssemblerState } from "./types";
import { handleDirective, sizeOfDirective } from "./directives";
import { runFunction } from "./functions";
import { parseImmediate } from "./immediates";

interface IAssembleOpts {
  text?: boolean;
}

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
  arr = arr.filter(line => {
    if (line[0] === ".") {
      handleDirective(line, state);
      state.outIndex += sizeOfDirective(line);
      return true; // Leave directives
    }

    if (_parseGlobalLabel(line, state)) {
      return false; // State was updated, can filter the label out.
    }

    state.outIndex += 4; // Well, this better be a typical instruction!
    return true;
  });

  state.buffer = new ArrayBuffer(state.outIndex);
  state.dataView = new DataView(state.buffer);

  state.memPos = 0;
  state.outIndex = 0;

  // Second pass, assemble!
  arr.forEach(line => {
    if (line[0] === ".") {
      handleDirective(line, state);
      state.outIndex += sizeOfDirective(line);
      return;
    }

    // Apply any built-in functions, symbols.
    const instPieces = line.split(/[,\s]+/g);
    if (instPieces.length) {
      let lastPiece = runFunction(instPieces[instPieces.length - 1], state);
      if (lastPiece !== null) {
        lastPiece = _fixBranch(instPieces[0], lastPiece, state);

        instPieces[instPieces.length - 1] = lastPiece;
        line = instPieces.join(" ");
      }
    }

    if (opts.text)
      outStrs.push(line);

    // At this point, we should be able to parse the instruction.
    console.log(line);
    const inst = parse(line);
    state.dataView.setUint32(state.outIndex, inst);

    state.outIndex += 4;
  });

  console.log(state);

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

    return line.substr(removalIndex);
  });
}

/** Parses a LABEL: expression and adds it to the symbol table. */
function _parseGlobalLabel(line: string, state: IAssemblerState): boolean {
  const labelRegex = /^(\w+)\:\s*$/;
  const results = line.match(labelRegex);
  if (results === null)
    return false; // Not a label.

  const [, name] = results;
  state.symbols[name] = (state.memPos + state.outIndex) >>> 0;
  return true;
}

/** Transforms branches from absolute to relative. */
function _fixBranch(inst: string, offset: string, state: IAssemblerState): string {
  if (_instIsBranch(inst)) {
    const imm = parseImmediate(offset); // Should definitely succeed.
    const memOffset = state.memPos + state.outIndex;
    const diff = (imm - memOffset) / 4;
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
    memPos: 0,
    outIndex: 0,
    symbols: Object.create(null),
  };
}

function _ensureArray(input: string | string[]): string[] {
  if (typeof input === "string")
    return input.split(/\r?\n/);

  if (!Array.isArray(input))
    throw new Error("Input must be a string or array of strings");

  return input;
}