import { throwError } from "../errors";
import { IAssemblerState } from "../state";

/**
 * Absolute value of the given `value`.
 */
export function abs(state: IAssemblerState, value: string | number): number {
  if (typeof value === "string")
    throwError(`Assembler function abs cannot be called with string "${value}", value must be a number.`, state);

  return Math.abs(value);
};
