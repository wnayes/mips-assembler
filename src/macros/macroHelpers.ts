import { IAssemblerState } from "../state";

export function basicMacroMatcher(macroAlias: string) {
  const regex = makeMacroRegExp(macroAlias);
  return (state: IAssemblerState) => !!state.line.match(regex);
}

export function makeMacroRegExp(macroAlias: string): RegExp {
  return new RegExp(
    `^${macroAlias}\\s+`,
    "i"
  );
}
