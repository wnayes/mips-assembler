import { parseImmediate } from "./immediates";
import { getSymbolValue } from "./symbols";
import { unescapeString } from "./strings";
import { LABEL_CHARS } from "./labels";
import { abs } from "./functions/abs";
import { hi } from "./functions/hi";
import { lo } from "./functions/lo";
import { org } from "./functions/org";
import { throwError } from "./errors";
/** Runs any built-in functions, and also resolves symbols. */
export function runFunction(value, state) {
    return _runFunction(value, state);
}
var fnRegex = new RegExp("^([-\\w]+)\\(([\\(\\),-\\w" + LABEL_CHARS + "]*)\\)$", "i");
function _runFunction(value, state) {
    var results = fnRegex.exec(value);
    if (results === null) { // Not a function
        // Symbol?
        var symbolValue = getSymbolValue(state, value);
        if (symbolValue !== null) {
            return symbolValue;
        }
        // Number?
        var imm = parseImmediate(value);
        if (imm !== null) {
            return imm;
        }
        // String?
        var str = unescapeString(value);
        if (typeof str === "string") {
            return str;
        }
        return null;
    }
    else {
        var fn = results[1];
        if (!fns[fn]) {
            // Did a symbol label accidentally look like a function?
            var symbolValue = getSymbolValue(state, fn);
            if (symbolValue !== null) {
                return symbolValue;
            }
            return null; // Might have been something like 0x10(V0)
        }
        // Parse args slightly different than the regex suggests,
        // to support lo(label)(V0)
        var fnArgs = "";
        var parenLevel = 0;
        var i = void 0;
        for (i = fn.length + 1; i < value.length - 1; i++) {
            var char = value[i];
            if (char === "(") {
                parenLevel++;
            }
            else if (char === ")") {
                parenLevel--;
                if (parenLevel < 0) {
                    i++;
                    break;
                }
            }
            fnArgs += char;
        }
        var extraStr = "";
        if (i < value.length - 1) {
            // There was extra content after the end of the function,
            // like the (VO) of lo(label)(V0)
            extraStr = value.substring(i, value.length);
        }
        // TODO: Doesn't support nested calls, multiple arguments.
        var arg = 0;
        if (fnArgs) {
            arg = _runFunction(fnArgs, state);
        }
        if (arg === null) {
            throwError("Could not evaluate " + fnArgs, state);
            return null;
        }
        var result = fns[fn](state, arg);
        if (extraStr) {
            result = result + extraStr;
        }
        return result;
    }
}
/** Built-in functions */
var fns = Object.create(null);
fns.abs = abs;
fns.hi = hi;
fns.lo = lo;
fns.org = org;
