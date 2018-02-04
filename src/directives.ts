import { IAssemblerState } from "./types";
import { parseImmediate } from "./immediates";

export function handleDirective(line: string, state: IAssemblerState): void {
  if (_orgDirective(line, state)
    || _defineLabelDirective(line, state)
  ) { return; }

  throw new Error(`handleDirective: Unrecongized directive ${line}`);
}

export function sizeOfDirective(line: string): number {
  const lowerCaseLine = line.toLowerCase();
  if (lowerCaseLine.indexOf(".org") === 0) return 0;
  if (lowerCaseLine.indexOf(".definelabel") === 0) return 0;

  throw new Error(`sizeOfDirective: Unrecongized directive ${line}`);
}

function _orgDirective(line: string, state: IAssemblerState): boolean {
  const orgRegex = /^\.org\s+(\w+)$/i;
  const results = line.match(orgRegex);
  if (results === null)
    return false; // Not .org

  const [, loc] = results;
  const imm = parseImmediate(loc);
  if (imm === null)
    throw new Error(`Could not parse .org immediate ${loc}`);

  state.memPos = imm >>> 0; // Better be 32-bit
  return true;
}

/** Parses .definelabel and adds the symbol */
function _defineLabelDirective(line: string, state: IAssemblerState): boolean {
  const defineLabelRegex = /^\.definelabel\s+(\w+)[\s,]+(\w+)$/i;
  const results = line.match(defineLabelRegex);
  if (results === null)
    return false; // Not .definelabel

  const [, name, value] = results;

  const imm = parseImmediate(value);
  if (imm === null) {
    if (!state.symbols[value])
      throw new Error(".definelabel value must be numeric or an alias to another label");

    state.symbols[name] = state.symbols[value]; // Alias
  }
  else {
    state.symbols[name] = imm;
  }

  return true; // Symbol added
}
