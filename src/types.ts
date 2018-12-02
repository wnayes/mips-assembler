export enum AssemblerPhase {
  firstPass,
  secondPass
}

export type IAssemblerState = IAssemblerStateFirstPass | IAssemblerStateSecondPass;

interface IAssemblerStateFirstPass extends IAssemblerStateBase {
  currentPass: AssemblerPhase.firstPass;

  /** Output buffer. */
  buffer: null;

  /** DataView against the buffer. */
  dataView: null;

  /** Evaluated results of an expression list on the line. */
  evaluatedLineExpressions: null;
}

interface IAssemblerStateSecondPass extends IAssemblerStateBase {
  currentPass: AssemblerPhase.secondPass;

  /** Output buffer. */
  buffer: ArrayBuffer;

  /** DataView against the buffer. */
  dataView: DataView;

  /** Evaluated results of an expression list on the line. */
  evaluatedLineExpressions: (string | number | null)[];
}

interface IAssemblerStateBase {
  currentPass: AssemblerPhase;

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

  /**
   * When requested, is populated with the memory locations of symbols after
   * assembly.
   */
  symbolOutputMap?: { [name: string]: number } | null | undefined;

  /** The last global label that was passed during the assembly. */
  currentLabel: string | null;

  /** Symbol table for local labels. */
  localSymbols: {
    [globalLabelName: string]: {
      [localLabelName: string]: number
    }
  }

  /** Pre-evaluated expression list on the line. */
  lineExpressions: string[];

  /** Stack of if/else block states tracked during the assembly. */
  ifElseStack: IfElseStateFlags[];
}

/** States of an if/else/endif level. */
export enum IfElseStateFlags {
  /** Unused */
  None,

  /**
   * We are within an if block, but haven't reached a part we should execute.
   */
  AcceptingBlock = 1 << 0,

  /** We are executing code within an if/else block. */
  ExecutingBlock = 1 << 1,

  /**
   * We have already executed an if or elseif block, and are passing over
   * remaining instructions.
   */
  NoLongerAcceptingBlock = 1 << 2,

  /** Flag set once a plain else directive is encountered. */
  SawElse = 1 << 3,
}

/** Mask for checking current block state. */
export const IfElseBlockStateMask =
  IfElseStateFlags.AcceptingBlock
  | IfElseStateFlags.ExecutingBlock
  | IfElseStateFlags.NoLongerAcceptingBlock;
