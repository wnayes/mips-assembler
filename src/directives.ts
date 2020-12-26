import { IAssemblerState } from "./state";

import definelabel from "./directives/definelabel";
import equ from "./directives/equ";
import org from "./directives/org";
import orga from "./directives/orga";
import align from "./directives/align";
import skip from "./directives/skip";
import fill from "./directives/fill";
import { ascii, asciiz } from "./directives/ascii";
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

import beqz from "./macros/beqz";
import bnez from "./macros/bnez";
import bnezl from "./macros/bnezl";
import li from "./macros/li";
import move from "./macros/move";

interface IDirectiveFunction {
  (state: IAssemblerState): void;
  matches: (state: IAssemblerState) => boolean;
}

const directives: IDirectiveFunction[] = [
  definelabel,
  equ,
  org,
  orga,
  align,
  skip,
  fill,
  ascii,
  asciiz,
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

const macros: IDirectiveFunction[] = [
  beqz,
  bnez,
  bnezl,
  li,
  move,
];

/**
 * Returns a directive function to run for the given state/line.
 * @param state Current assembler state.
 */
export function getDirectiveToRun(state: IAssemblerState): IDirectiveFunction | null {
  for (const directive of directives) {
    if (directive.matches(state)) {
      return directive;
    }
  }
  for (const macro of macros) {
    if (macro.matches(state)) {
      return macro;
    }
  }
  return null;
}

/**
 * Runs a directive, which changes the assembler state.
 * @param state Current assembler state.
 */
export function handleDirective(state: IAssemblerState, directive: IDirectiveFunction): void {
  directive(state);
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
