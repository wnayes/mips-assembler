export as namespace MIPSAssem;

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
export function assemble(input: string | string[], opts?: IAssembleOpts): ArrayBuffer | string[];
