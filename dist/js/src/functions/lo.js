import { throwError } from "../errors";
/** Returns the sign-extended low half of a 32-bit `value`. */
export function lo(state, value) {
    if (typeof value === "string")
        throwError("Assembler function lo cannot be called with string \"" + value + "\", value must be a number.", state);
    return value & 0x0000FFFF;
}
;
