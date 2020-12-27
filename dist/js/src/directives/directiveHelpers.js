import { EXPR_CHARS } from "../expressions";
export function basicDirectiveMatcher(directiveAlias, noArgs) {
    var regex = makeBasicDirectiveRegExp(directiveAlias, noArgs);
    return function (state) { return !!state.line.match(regex); };
}
export function makeBasicDirectiveRegExp(directiveAlias, noArgs) {
    return new RegExp("^\\." + directiveAlias + (noArgs ? "" : "\\s+"), "i");
}
export function makeNumericExprListRegExp(directiveAlias) {
    return new RegExp("^\\." + directiveAlias + "\\s+([" + EXPR_CHARS + "]+)$", "i");
}
