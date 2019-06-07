import { IAssemblerState } from "./state";
import { runFunction } from "./functions";
import { formatImmediate } from "./immediates";
import { LABEL_CHARS } from "./labels";
import { throwError } from "./errors";

export const EXPR_CHARS = ",-\\w\\s\\(\\)" + LABEL_CHARS;

export function parseExpressionsOnCurrentLine(state: IAssemblerState): void {
  let line = state.line;
  const firstSpaceIndex = line.indexOf(" ");
  if (firstSpaceIndex === -1) {
    state.lineExpressions = [];
    return; // Must not have any arguments, there would need to be a space for those.
  }

  const exprList = line.substr(firstSpaceIndex + 1);
  const exprs = splitExpressionList(exprList);
  state.lineExpressions = exprs;
}

export function evaluateExpressionsOnCurrentLine(state: IAssemblerState): string {
  let line = state.line;
  const firstSpaceIndex = line.indexOf(" ");
  if (firstSpaceIndex === -1)
    return line; // Must not have any arguments, there would need to be a space for those.

  const firstPiece = line.substring(0, firstSpaceIndex);
  const exprList = line.substr(firstSpaceIndex + 1);
  const exprs = splitExpressionList(exprList);
  state.lineExpressions = exprs;

  if (exprs.length > 0) {
    const evaluatedExprs = exprs.map((expr, i) => {
      let evaluated = runFunction(expr, state);

      // For the last piece, do extra logic to fix branch values.
      if (typeof evaluated === "number" && i === exprs.length - 1) {
        evaluated = _fixBranch(firstPiece, evaluated, state);
      }

      return evaluated;
    });

    state.evaluatedLineExpressions = evaluatedExprs;
    line = firstPiece + " " + _formatEvaluatedExprs(evaluatedExprs, exprs).join(" ");
  }

  return line;
}

function _formatEvaluatedExprs(values: (string | number | null)[], originalValues: string[]): string[] {
  return values.map((value, i) => {
    if (typeof value === "number") {
      return formatImmediate(value);
    }
    if (value === null) {
      return originalValues[i];
    }
    return value;
  });
}

/** Transforms branches from absolute to relative. */
function _fixBranch(inst: string, offset: number, state: IAssemblerState): number {
  if (_instIsBranch(inst)) {
    const memOffset = state.memPos + state.outIndex;
    const offsetDiff = offset - memOffset;
    if (offsetDiff % 4 !== 0) {
      throwError("Misaligned branch instruction detected", state);
    }
    const diff = (offsetDiff / 4) - 1;
    return diff;
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

function splitExpressionList(str: string): string[] {
  const pieces: string[] = [];

  let currentPiece = "";
  let currentStrQuoteChar = ""; // When set, we're writing a string
  let currentParenLevel = 0; // When > 0, we're inside a parenthesis grouper
  let escaped = false;
  let prevChar = "";

  function writeToCurrentPiece(char: string): void {
    currentPiece += char;
  }

  function endCurrentPiece(): void {
    while (charSplitsExpressions(currentPiece[currentPiece.length - 1])) {
      currentPiece = currentPiece.slice(0, -1);
    }
    currentPiece = currentPiece.trim(); // Sanity check

    // We actually have only seen white spaces, so don't create a separate piece yet.
    if (!currentPiece)
      return;

    pieces.push(currentPiece);
    currentPiece = "";
  }

  function endPieceIfApplicable(): void {
    if (currentStrQuoteChar || currentParenLevel)
      return; // Still need to close a string/group, can't end piece.

    if (!charSplitsExpressions(prevChar))
      return; // Still writing something.

    endCurrentPiece();
  }

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    endPieceIfApplicable();

    switch (char) {
      case "\\":
        if (!escaped) {
          escaped = true;
        }
        break;

      case "(":
        if (!escaped && !currentStrQuoteChar) {
          currentParenLevel++;
        }
        break;

      case ")":
        if (!escaped && !currentStrQuoteChar) {
          if (currentParenLevel <= 0) {
            throw new Error("Imbalanced parenthesis in expression: " + str);
          }
          currentParenLevel--;
        }
        break;

      case "\"":
      case "'":
        if (!escaped) {
          if (currentStrQuoteChar) {
            if (currentStrQuoteChar === char) { // Ending string
              currentStrQuoteChar = "";
            }
            // Else just writing a quote inside, ex: "assembler's"
          }
          else { // Beginning string
            currentStrQuoteChar = char;
          }
        }
        break;
    }

    writeToCurrentPiece(char);

    if (char !== "\\") {
      escaped = false;
    }

    prevChar = char;
  }

  if (currentParenLevel > 0)
    throw new Error("Imbalanced parenthesis in expression: " + str);

  if (currentStrQuoteChar)
    throw new Error("Unterminated string: " + currentPiece);

  endCurrentPiece();

  return pieces;
}

function charSplitsExpressions(char: string): boolean {
  return char === "," || charIsWhitespace(char);
}

function charIsWhitespace(char: string): boolean {
  return char === " " || char === "\t";
}