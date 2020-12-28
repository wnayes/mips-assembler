import { IAssemblerState } from "../state";
import { addSymbol } from "../symbols";
import { LABEL_REGEX_STR } from "../labels";
import { throwError } from "../errors";
import { firstIndexOf } from "../strings";

const equRegex = new RegExp(
  `^\\s*(${LABEL_REGEX_STR})\\s+equ(?:$|(?:\\s+(.+)$))`,
  "i"
);

/**
 * `equ` is used for direct text replacement.
 * @param state Current assembler state.
 */
export default function equ(state: IAssemblerState): boolean {
  const match = state.line.match(equRegex);
  if (!match) {
    throwError("equ directive was not able to be parsed", state);
  }

  // lineExpressions only has ["equ", value] and might split the value, so use regex.
  const name = match[1];
  const value = match[2] || "";

  addSymbol(state, name, value);

  return true; // Symbol added
}

equ.matches = (state: IAssemblerState) => {
  const results = state.line.match(equRegex);
  return results !== null;
};
