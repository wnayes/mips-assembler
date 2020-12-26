import { IfElseStateFlags } from "./conditionals";
import { AssemblerPhase } from "./types";
import { IAssembleOpts } from "./assembler";
import { FunctionResult } from "./functions";

export function makeNewAssemblerState(opts: IAssembleOpts): IAssemblerState {
  const staticSymbolIndices: any = [0];
  staticSymbolIndices.before = Object.create(null);
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
    staticSymbolIndices,
    currentPass: AssemblerPhase.firstPass,
    lineExpressions: [],
    evaluatedLineExpressions: null,
    ifElseStack: [],
    files: opts.files || Object.create(null),
    linesToInsert: null,
  };
}

export type ISymbolTable = { [label: string]: number | string };

type ISymbolValueTable = { [K in string | number]: string };

type IStaticSymbolIndices = number[] & { before: { [index: number]: number }}

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
  evaluatedLineExpressions: FunctionResult[];
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
  symbols: ISymbolTable;

  /** Symbol table of values */
  symbolsByValue: ISymbolValueTable;

  /**
   * When requested, is populated with the memory locations of symbols after
   * assembly.
   */
  symbolOutputMap?: ISymbolTable | null | undefined;

  /** The last global label that was passed during the assembly. */
  currentLabel: string | null;

  /** Symbol table for local labels. */
  localSymbols: {
    [globalLabelName: string]: {
      [localLabelName: string]: number | string
    }
  }

  /** Symbol table(s) for static labels. */
  staticSymbols: ISymbolTable[];

  /** Index of the current array in `staticSymbols`. */
  staticSymbolIndices: IStaticSymbolIndices;

  /** Pre-evaluated expression list on the line. */
  lineExpressions: string[];

  /** Stack of if/else block states tracked during the assembly. */
  ifElseStack: IfElseStateFlags[];

  /** Assembly files available to include. */
  files: { [name: string]: string };
}
