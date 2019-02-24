import { EXPR_CHARS } from "../expressions";
import { IAssemblerState } from "../state";

export function basicDirectiveMatcher(directiveAlias: string, noArgs?: boolean) {
  const regex = makeBasicDirectiveRegExp(directiveAlias, noArgs);
  return (state: IAssemblerState) => !!state.line.match(regex);
}

export function makeBasicDirectiveRegExp(directiveAlias: string, noArgs?: boolean): RegExp {
  return new RegExp(
    `^\\.${directiveAlias}${noArgs ? "" : "\\s+"}`,
    "i"
  )
}

export function makeNumericExprListRegExp(directiveAlias: string): RegExp {
  return new RegExp(
    `^\\.${directiveAlias}\\s+([${EXPR_CHARS}]+)$`,
    "i"
  )
}
