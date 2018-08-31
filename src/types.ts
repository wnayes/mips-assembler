export enum AssemblerPhase {
  firstPass,
  secondPass
}

export interface IAssemblerState {
  /** Output buffer. */
  buffer: ArrayBuffer;

  /** DataView against the buffer. */
  dataView: DataView;

  /** Current line being assembled. */
  line: string;

  /** Memory address output position. Adjusted by .org directive. */
  memPos: number;

  /** Actual index in output buffer. */
  outIndex: number;

  /** Symbol table. Populated by .definelabel directives. */
  symbols: { [name: string]: number };

  /** Symbol table of values */
  symbolsByValue: { [value: number]: string };

  /** The last global label that was passed during the assembly. */
  currentLabel: string | null;

  /** Symbol table for local labels. */
  localSymbols: {
    [globalLabelName: string]: {
      [localLabelName: string]: number
    }
  }

  currentPass: AssemblerPhase;
}
