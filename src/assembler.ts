import { parse } from "mips-inst";

import { AssemblerPhase } from "./types";
import { handleDirective, isConditionalDirective, getDirectiveToRun } from "./directives";
import { parseGlobalLabel } from "./labels";
import { getSymbolByValue } from "./symbols";
import { evaluateExpressionsOnCurrentLine, parseExpressionsOnCurrentLine } from "./expressions";
import { IfElseStateFlags } from "./conditionals";
import { makeNewAssemblerState, IAssemblerState } from "./state";
import { throwError } from "./errors";

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
 * @param input Assembly text or lines.
 * @param opts Optional parameters.
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

    const directive = getDirectiveToRun(state);
    if (directive) {
      parseExpressionsOnCurrentLine(state);
      handleDirective(state, directive);
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

    const directive = getDirectiveToRun(state);
    if (directive) {
      evaluateExpressionsOnCurrentLine(state);
      handleDirective(state, directive);
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
    let inst: number;
    try {
      inst = parse(line);
    }
    catch (e) {
      throwError(e, state);
      return;
    }
    state.dataView!.setUint32(state.outIndex, inst);

    state.outIndex += 4;
  });

  if (state.ifElseStack.length) {
    throwError("An if directive was used without an endif directive", state);
  }
  if (state.staticSymbolIndices[0] !== 0) {
    throwError("A beginfile directive was used without an endfile directive", state);
  }

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
  arr = arr.filter(s => typeof s === "string");
  arr = _stripComments(arr);
  arr = arr.map(s => s.trim());
  arr = arr.filter(Boolean);
  return arr;
}

/**
 * Strips single line ; or // comments.
 * This isn't perfect, but it does try to detect cases where the comment
 * characters are within a quoted string.
 */
function _stripComments(input: string[]): string[] {
  let withinBlockComment = false;

  const lines = input.map(line => {
    if (withinBlockComment) {
      // The only thing that can break us out is the closing block comment.
      const blockCommentEndIndex = line.indexOf("*/");
      if (blockCommentEndIndex >= 0) {
        line = line.substr(blockCommentEndIndex + 2);
        withinBlockComment = false;
      }
    }

    if (withinBlockComment) {
      return "";
    }

    let blockCommentIndex = line.indexOf("/*");
    while (blockCommentIndex >= 0) {
      if (!_appearsSurroundedByQuotes(line, blockCommentIndex)) {
        const blockCommentEndIndex = line.indexOf("*/", blockCommentIndex + 2);
        if (blockCommentEndIndex >= 0) {
          line = line.substr(0, blockCommentIndex) + line.substr(blockCommentEndIndex + 2);
        }
        else {
          line = line.substr(0, blockCommentIndex);
          withinBlockComment = true;
          break;
        }
      }
      else {
        blockCommentIndex++; // Avoid infinite loop
      }
      blockCommentIndex = line.indexOf("/*", blockCommentIndex);
    }

    let semicolonIndex = line.indexOf(";");
    while (semicolonIndex >= 0) {
      if (!_appearsSurroundedByQuotes(line, semicolonIndex)) {
        line = line.substr(0, semicolonIndex);

        // This invalidates any block comment we found earlier this iteration.
        withinBlockComment = false;
        break;
      }
      semicolonIndex = line.indexOf(";", semicolonIndex + 1);
    }

    let slashesIndex = line.indexOf("//");
    while (slashesIndex >= 0) {
      if (!_appearsSurroundedByQuotes(line, slashesIndex)) {
        line = line.substr(0, slashesIndex);

        // This invalidates any block comment we found earlier this iteration.
        withinBlockComment = false;
        break;
      }
      slashesIndex = line.indexOf("//", slashesIndex + 2);
    }

    return line;
  });

  if (withinBlockComment) {
    throw new Error("Unclosed block comment detected.");
  }

  return lines;
}

function _appearsSurroundedByQuotes(line: string, position: number): boolean {
  return _appearsSurroundedByCharacter(line, position, "\"")
    || _appearsSurroundedByCharacter(line, position, "'");
}

function _appearsSurroundedByCharacter(line: string, position: number, char: string): boolean {
  const firstCharIndex = line.indexOf(char);
  if (firstCharIndex === -1)
    return false;
  if (firstCharIndex > position)
    return false;

  const afterPosCharIndex = line.indexOf(char, position);
  if (afterPosCharIndex === -1)
    return false;
  return true; // Position seems to be surrounded by character.
}

function _ensureArray(input: string | string[]): string[] {
  if (typeof input === "string")
    return input.split(/\r?\n/);

  if (!Array.isArray(input))
    throw new Error("Input must be a string or array of strings");

  return input;
}
