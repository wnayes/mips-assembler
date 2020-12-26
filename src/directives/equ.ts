import { IAssemblerState } from "../state";
import { addSymbol } from "../symbols";
import { LABEL_REGEX_STR } from "../labels";
import { throwError } from "../errors";
import { firstIndexOf } from "../strings";

/**
 * `equ` is used for direct text replacement.
 * @param state Current assembler state.
 */
export default function equ(state: IAssemblerState): boolean {
  if (state.lineExpressions.length !== 2) {
    throwError("equ must be used in the format \"[label] equ [value]\"", state);
  }

  // lineExpressions only has ["equ", value]
  const name = state.line.substr(0, firstIndexOf(" ", "\t"));
  const value = state.lineExpressions[1];

  addSymbol(state, name, value);

  return true; // Symbol added
}

const equRegex = new RegExp(
  `^\\s*(${LABEL_REGEX_STR})\\s+equ\\s+(.+)$`,
  "i"
);

equ.matches = (state: IAssemblerState) => {
  const results = state.line.match(equRegex);
  return results !== null;
};
