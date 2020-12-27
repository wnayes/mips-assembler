var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { parse } from "mips-inst";
import { AssemblerPhase } from "./types";
import { handleDirective, isConditionalDirective, getDirectiveToRun } from "./directives";
import { parseGlobalLabel } from "./labels";
import { getSymbolByValue } from "./symbols";
import { evaluateExpressionsOnCurrentLine, parseExpressionsOnCurrentLine } from "./expressions";
import { IfElseStateFlags } from "./conditionals";
import { makeNewAssemblerState } from "./state";
import { throwError } from "./errors";
/**
 * Assembles the given input instructions.
 * @param input Assembly text or lines.
 * @param opts Optional parameters.
 */
export function assemble(input, opts) {
    opts = opts || {};
    var arr = normalizeInput(input);
    var state = makeNewAssemblerState(opts);
    var outStrs = [];
    // First pass, calculate label positions.
    // Not using `arr.map` because `arr` changes mid-processing.
    var arrNew = [];
    for (var i = 0; i < arr.length; i++) {
        var line = arr[i];
        state.line = line;
        if (shouldSkipCurrentInstruction(state)) {
            if (line) {
                arrNew.push(line);
            }
            continue;
        }
        line = processLabelsOnCurrentLine(state);
        var directive = getDirectiveToRun(state);
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
            var linesToInsert = normalizeInput(state.linesToInsert);
            arr.splice.apply(arr, __spreadArrays([i + 1, 0], linesToInsert));
            state.linesToInsert = null;
        }
    }
    ;
    arr = arrNew;
    state.buffer = opts.buffer || new ArrayBuffer(state.outIndex);
    state.dataView = new DataView(state.buffer);
    state.memPos = 0;
    state.outIndex = 0;
    state.currentPass = AssemblerPhase.secondPass;
    // Second pass, assemble!
    arr.forEach(function (line) {
        state.line = line;
        state.lineExpressions = [];
        state.evaluatedLineExpressions = [];
        if (shouldSkipCurrentInstruction(state))
            return line;
        var directive = getDirectiveToRun(state);
        if (directive) {
            evaluateExpressionsOnCurrentLine(state);
            handleDirective(state, directive);
            return;
        }
        // Start a new "area" if we hit a global symbol boundary.
        var globalSymbol = getSymbolByValue(state, state.memPos + state.outIndex);
        if (globalSymbol !== null) {
            state.currentLabel = globalSymbol;
        }
        // Apply any built-in functions, symbols.
        line = state.line = evaluateExpressionsOnCurrentLine(state);
        if (opts.text)
            outStrs.push(line);
        // At this point, we should be able to parse the instruction.
        var inst;
        try {
            inst = parse(line);
        }
        catch (e) {
            throwError(e, state);
            return;
        }
        state.dataView.setUint32(state.outIndex, inst);
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
function shouldSkipCurrentInstruction(state) {
    if (state.ifElseStack.length) {
        var ifElseState = state.ifElseStack[state.ifElseStack.length - 1];
        return !(ifElseState & IfElseStateFlags.ExecutingBlock)
            && !isConditionalDirective(state.line);
    }
    return false;
}
function processLabelsOnCurrentLine(state) {
    var parsedLabel;
    while (parsedLabel = parseGlobalLabel(state)) {
        state.line = state.line.substr(parsedLabel.length + 1).trim();
    }
    return state.line;
}
function normalizeInput(input) {
    var arr = _ensureArray(input);
    arr = arr.filter(function (s) { return typeof s === "string"; });
    arr = _stripComments(arr);
    arr = arr.map(function (s) { return s.trim(); });
    arr = arr.filter(Boolean);
    return arr;
}
/**
 * Strips single line ; or // comments.
 * This isn't perfect, but it does try to detect cases where the comment
 * characters are within a quoted string.
 */
function _stripComments(input) {
    var withinBlockComment = false;
    var lines = input.map(function (line) {
        if (withinBlockComment) {
            // The only thing that can break us out is the closing block comment.
            var blockCommentEndIndex = line.indexOf("*/");
            if (blockCommentEndIndex >= 0) {
                line = line.substr(blockCommentEndIndex + 2);
                withinBlockComment = false;
            }
        }
        if (withinBlockComment) {
            return "";
        }
        var blockCommentIndex = line.indexOf("/*");
        while (blockCommentIndex >= 0) {
            if (!_appearsSurroundedByQuotes(line, blockCommentIndex)) {
                var blockCommentEndIndex = line.indexOf("*/", blockCommentIndex + 2);
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
        var semicolonIndex = line.indexOf(";");
        while (semicolonIndex >= 0) {
            if (!_appearsSurroundedByQuotes(line, semicolonIndex)) {
                line = line.substr(0, semicolonIndex);
                // This invalidates any block comment we found earlier this iteration.
                withinBlockComment = false;
                break;
            }
            semicolonIndex = line.indexOf(";", semicolonIndex + 1);
        }
        var slashesIndex = line.indexOf("//");
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
function _appearsSurroundedByQuotes(line, position) {
    return _appearsSurroundedByCharacter(line, position, "\"")
        || _appearsSurroundedByCharacter(line, position, "'");
}
function _appearsSurroundedByCharacter(line, position, char) {
    var firstCharIndex = line.indexOf(char);
    if (firstCharIndex === -1)
        return false;
    if (firstCharIndex > position)
        return false;
    var afterPosCharIndex = line.indexOf(char, position);
    if (afterPosCharIndex === -1)
        return false;
    return true; // Position seems to be surrounded by character.
}
function _ensureArray(input) {
    if (typeof input === "string")
        return input.split(/\r?\n/);
    if (!Array.isArray(input))
        throw new Error("Input must be a string or array of strings");
    return input;
}
