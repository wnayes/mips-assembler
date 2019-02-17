import { IAssemblerState } from "../state";

/**
 * Returns the high half of a 32-bit `value`, adjusted for sign extension of
 * the low half.
 */
export function hi(state: IAssemblerState, value: string | number): number {
  if (typeof value === "string")
    throw new Error(`Assembler function hi cannot be called with string "${value}", value must be a number.`);

  let lower = value & 0x0000FFFF;
  let upper = value >>> 16;
  if (lower & 0x8000)
    upper += 1;
  return upper;
};
