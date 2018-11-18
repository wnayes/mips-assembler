import { EXPR_CHARS } from "../expressions";

export function makeNumericExprListRegExp(directiveAlias: string): RegExp {
  return new RegExp(
    `^\\.${directiveAlias}\\s+([${EXPR_CHARS}]+)$`,
    "i"
  )
}
