import { IAssemblerState, AssemblerPhase } from "./types";
import { parseImmediate } from "./immediates";

import definelabel from "./directives/definelabel";
import org from "./directives/org";
import orga from "./directives/orga";
import align from "./directives/align";
import skip from "./directives/skip";
import fill from "./directives/fill";
import ascii from "./directives/ascii";
import byte from "./directives/byte";
import halfword from "./directives/halfword";
import word from "./directives/word";

function getDirectives() {
  return [
    definelabel,
    org,
    orga,
    align,
    skip,
    fill,
    ascii,
    byte,
    halfword,
    word,
  ];
}

/**
 * Runs a directive, which changes the assembler state.
 * @param state Current assembler state.
 */
export function handleDirective(state: IAssemblerState): void {
  if (getDirectives().some(directive => directive(state)))
    return;

  throw new Error(`handleDirective: Unrecongized directive ${state.line}`);
}
