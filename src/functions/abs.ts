import { IAssemblerState } from "../state";

/**
 * Absolute value of the given `value`.
 */
export function abs(state: IAssemblerState, value: string | number): number {
  if (typeof value === "string")
    throw new Error(`Assembler function abs cannot be called with string "${value}", value must be a number.`);

  return Math.abs(value);
};
