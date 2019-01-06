import { parse } from "mips-inst";

import { AssemblerPhase } from "./types";
import { handleDirective, isConditionalDirective } from "./directives";
import { parseGlobalLabel } from "./labels";
import { getSymbolByValue } from "./symbols";
import { evaluateExpressionsOnCurrentLine, parseExpressionsOnCurrentLine } from "./expressions";
import { IfElseStateFlags } from "./conditionals";
import { makeNewAssemblerState, IAssemblerState } from "./state";

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
   * Object containing "file names" and strings containing assembly.
   * These files can be used with the `.include` directive.
   */
  files?: { [name: string]: string };

  /**
   * After assembly, if an object is passed, it will be populated with a map
   * of symbol names to their memory output location in the buffer.
   */
  symbolOutputMap?: { [name: string]: number };

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

  let arr = normalizeInput(input);

  const state = makeNewAssemblerState(opts);

  const outStrs: string[] = [];

  // First pass, calculate label positions.
  // Not using `arr.map` because `arr` changes mid-processing.
  let arrNew = [];
  for (let i = 0; i < arr.length; i++) {
    let line = arr[i];
    state.line = line;

    if (shouldSkipCurrentInstruction(state)) {
      if (line) {
        arrNew.push(line);
      }
      continue;
    }

    line = processLabelsOnCurrentLine(state);

    if (line[0] === ".") {
      parseExpressionsOnCurrentLine(state);
      handleDirective(state);
      line = state.line; // Directive may change the line.
    }
    else {
      // If !line, then only labels were on the line.
      if (line) {
        state.outIndex += 4;
      }
    }

    if (line) {
      arrNew.push(line);
    }

    if ("linesToInsert" in state && state.linesToInsert) {
      const linesToInsert = normalizeInput(state.linesToInsert);
      arr.splice(i + 1, 0, ...linesToInsert);
      state.linesToInsert = null;
    }
  };
  arr = arrNew;

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

    if (shouldSkipCurrentInstruction(state))
      return line;

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

  if (state.ifElseStack.length)
    throw new Error("An if directive was used without an endif directive");
  if (state.staticSymbolIndices[0] !== 0)
    throw new Error("A beginfile directive was used without an endfile directive");

  if (opts.text)
    return outStrs;

  return state.buffer;
}

/** Tests if the current state deems we shouldn't execute the current line. */
function shouldSkipCurrentInstruction(state: IAssemblerState): boolean {
  if (state.ifElseStack.length) {
    const ifElseState = state.ifElseStack[state.ifElseStack.length - 1];
    return !(ifElseState & IfElseStateFlags.ExecutingBlock)
      && !isConditionalDirective(state.line);
  }
  return false;
}

function processLabelsOnCurrentLine(state: IAssemblerState): string {
  let parsedLabel: string | boolean;
  while (parsedLabel = parseGlobalLabel(state)) {
    state.line = state.line.substr(parsedLabel.length + 1).trim();
  }
  return state.line;
}

function normalizeInput(input: string | string[]) {
  let arr = _ensureArray(input);
  arr = arr.filter(s => { return typeof s === "string"; });
  arr = _stripComments(arr);
  arr = arr.map(s => { return s.trim(); });
  arr = arr.filter(Boolean);
  return arr;
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

function _ensureArray(input: string | string[]): string[] {
  if (typeof input === "string")
    return input.split(/\r?\n/);

  if (!Array.isArray(input))
    throw new Error("Input must be a string or array of strings");

  return input;
}
