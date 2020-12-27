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
export function assemble(input: string | string[], opts?: IAssembleOpts): ArrayBuffer | string[];
