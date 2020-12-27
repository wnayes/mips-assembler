import { AssemblerPhase } from "../types";
import { runFunction } from "../functions";
import { throwError } from "../errors";
import { basicDirectiveMatcher } from "./directiveHelpers";
/**
 * Writes ascii bytes with a trailing zero.
 *
 * @param state Current assembler state.
 */
export function asciiz(state) {
    return ascii(state, true);
}
asciiz.matches = basicDirectiveMatcher("asciiz");
/**
 * Writes ascii bytes.
 *
 * .ascii value[,...]
 * .asciiz value[,...]
 *
 * `value` can either be a string or byte value.
 * ex: "string"
 * ex: 'string'
 * ex: 0x0A
 *
 * @param state Current assembler state.
 */
export function ascii(state, appendZero) {
    var numbers = [];
    var lineExps = state.lineExpressions;
    lineExps.forEach(function (expr) {
        var value = runFunction(expr, state);
        if (value === null)
            throwError("Could not parse .ascii value " + expr, state);
        if (typeof value === "number") {
            numbers.push(value);
        }
        else if (typeof value === "string") {
            for (var i = 0; i < value.length; i++) {
                numbers.push(value.charCodeAt(i));
            }
        }
    });
    if (appendZero)
        numbers.push(0); // Add NULL byte.
    if (state.currentPass === AssemblerPhase.secondPass) {
        for (var i = 0; i < numbers.length; i++) {
            if (numbers[i] < 0)
                state.dataView.setInt8(state.outIndex + i, numbers[i]);
            else
                state.dataView.setUint8(state.outIndex + i, numbers[i]);
        }
    }
    state.outIndex += numbers.length;
    return true;
}
ascii.matches = basicDirectiveMatcher("ascii");
