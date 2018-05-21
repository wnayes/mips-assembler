import { IAssemblerState, AssemblerPhase } from "./types";
import { parseImmediate } from "./immediates";

import definelabel from "./directives/definelabel";
import org from "./directives/org";
import orga from "./directives/orga";

export function handleDirective(state: IAssemblerState): void {
  if (definelabel(state)
    || orga(state)
    || org(state)
  ) {
    return;
  }

  throw new Error(`handleDirective: Unrecongized directive ${state.line}`);
}

export function sizeOfDirective(state: IAssemblerState): number {
  const lowerCaseLine = state.line.toLowerCase();
  if (lowerCaseLine.indexOf(".definelabel") === 0) return 0;
  if (lowerCaseLine.indexOf(".orga") === 0) return 0;
  if (lowerCaseLine.indexOf(".org") === 0) return 0;

  throw new Error(`sizeOfDirective: Unrecongized directive ${state.line}`);
}
