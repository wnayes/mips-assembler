import { IfElseStateFlags } from "./conditionals";
import { AssemblerPhase } from "./types";
import { IAssembleOpts } from "./assembler";

export function makeNewAssemblerState(opts: IAssembleOpts): IAssemblerState {
  return {
    buffer: null,
    dataView: null,
    line: "",
    memPos: 0,
    outIndex: 0,
    symbols: Object.create(null),
    symbolsByValue: Object.create(null),
    symbolOutputMap: opts.symbolOutputMap,
    currentLabel: null,
    localSymbols: Object.create(null),
    staticSymbols: [Object.create(null)],
    staticSymbolIndices: [0],
    currentPass: AssemblerPhase.firstPass,
    lineExpressions: [],
    evaluatedLineExpressions: null,
    ifElseStack: [],
    files: opts.files || Object.create(null),
    linesToInsert: null,
  };
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

  /**
   * Lines to insert into the current location being assembled.
   * Used by the `include` file directive for example.
   */
  linesToInsert: string | string[] | null;
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

  /** Symbol table(s) for static labels. */
  staticSymbols: { [staticLabelName: string]: number }[];

  /** Index of the current array in `staticSymbols`. */
  staticSymbolIndices: number[];

  /** Pre-evaluated expression list on the line. */
  lineExpressions: string[];

  /** Stack of if/else block states tracked during the assembly. */
  ifElseStack: IfElseStateFlags[];

  /** Assembly files available to include. */
  files: { [name: string]: string };
}
