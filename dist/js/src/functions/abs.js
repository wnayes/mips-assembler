import { throwError } from "../errors";
/**
 * Absolute value of the given `value`.
 */
export function abs(state, value) {
    if (typeof value === "string")
        throwError("Assembler function abs cannot be called with string \"" + value + "\", value must be a number.", state);
    return Math.abs(value);
}
;
