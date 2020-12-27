import { addSymbol } from "./symbols";
export var LABEL_CHARS = "\\?\\!\\@";
export var LABEL_REGEX_STR = "@?@?[\\w\\?\\!]+";
var labelRegex = new RegExp("^(" + LABEL_REGEX_STR + ")\\:");
/**
 * Parses a LABEL: expression and adds it to the symbol table.
 * Examples of valid labels:
 *    basicLabel:    excited!Label!:    mystery?Label?:
 *    @@localLabel:  12345:             !?!:
 */
export function parseGlobalLabel(state) {
    var results = state.line.match(labelRegex);
    if (results === null)
        return false; // Not a label.
    var name = results[1];
    if (!isLocalLabel(name) && !isStaticLabel(name)) {
        state.currentLabel = name;
    }
    addSymbol(state, name, getLabelValueFromState(state));
    return name;
}
export function isLocalLabel(name) {
    return name.indexOf("@@") === 0;
}
export function isStaticLabel(name) {
    return name.indexOf("@") === 0 && name[1] !== "@";
}
function getLabelValueFromState(state) {
    return (state.memPos + state.outIndex) >>> 0;
}
