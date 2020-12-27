export function basicMacroMatcher(macroAlias) {
    var regex = makeMacroRegExp(macroAlias);
    return function (state) { return !!state.line.match(regex); };
}
export function makeMacroRegExp(macroAlias) {
    return new RegExp("^" + macroAlias + "\\s+", "i");
}
