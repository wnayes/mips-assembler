import { EXPR_CHARS } from "../expressions";

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
