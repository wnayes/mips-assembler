import { IAssemblerState, AssemblerPhase } from "../types";
import { parseImmediate } from "../immediates";

const regexWord = /^\.word\s+([,-\w\s\(\)]+)$/i;
const regexDw = /^\.dw\s+([,-\w\s\(\)]+)$/i;

/**
 * Writes 32-bit values.
 * .word value[,...]
 * .dw value[,...]
 * @param state Current assembler state.
 */
export default function word(state: IAssemblerState): boolean {
  let results = state.line.match(regexWord);
  if (!results) {
    results = state.line.match(regexDw);
    if (!results)
      return false;
  }

  const [, wordsString] = results;
  const pieces = wordsString.split(",")
    .map(s => s.trim())
    .filter(s => !!s);

  if (state.currentPass === AssemblerPhase.secondPass) {
    const numbers = pieces.map(s => {
      let imm = parseImmediate(s);
      if (imm === null)
        throw new Error(`Could not parse .word immediate ${s}`);
      return imm;
    });

    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] < 0)
        state.dataView.setInt32(state.outIndex + (i * 4), numbers[i]);
      else
        state.dataView.setUint32(state.outIndex + (i * 4), numbers[i]);
    }
  }

  state.outIndex += 4 * pieces.length;

  return true;
}
