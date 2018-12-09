import { IAssemblerState } from "./state";

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
import float from "./directives/float";
import ifcond from "./directives/if";
import elseblock from "./directives/else";
import elseif from "./directives/elseif";
import endif from "./directives/endif";
import include from "./directives/include";
import beginfile from "./directives/beginfile";
import endfile from "./directives/endfile";

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
    float,
    ifcond,
    elseif,
    elseblock,
    endif,
    include,
    beginfile,
    endfile,
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

/**
 * Tests if a line represents a conditional block directive.
 * @param line Line from the pre-assembly input
 */
export function isConditionalDirective(line: string): boolean {
  const normalized = line.toLowerCase();
  return startsWith(normalized, ".if")
    || startsWith(normalized, ".else")
    || startsWith(normalized, ".endif");
}

function startsWith(str: string, search: string): boolean {
  return str.substr(0, search.length) === search;
}
