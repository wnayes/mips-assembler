import { IAssemblerState, AssemblerPhase } from "../types";
import { parseImmediate } from "../immediates";

const regexHalfword = /^\.halfword\s+([,-\w\s\(\)]+)$/i;
const regexDh = /^\.dh\s+([,-\w\s\(\)]+)$/i;

/**
 * Writes 16-bit values.
 * .halfword value[,...]
 * .dh value[,...]
 * @param state Current assembler state.
 */
export default function halfword(state: IAssemblerState): boolean {
  let results = state.line.match(regexHalfword);
  if (!results) {
    results = state.line.match(regexDh);
    if (!results)
      return false;
  }

  const [, halfwordsString] = results;
  const pieces = halfwordsString.split(",")
    .map(s => s.trim())
    .filter(s => !!s);

  if (state.currentPass === AssemblerPhase.secondPass) {
    const numbers = pieces.map(s => {
      let imm = parseImmediate(s);
      if (imm === null)
        throw new Error(`Could not parse .halfword immediate ${s}`);
      return imm;
    });

    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] < 0)
        state.dataView.setInt16(state.outIndex + (i * 2), numbers[i]);
      else
        state.dataView.setUint16(state.outIndex + (i * 2), numbers[i]);
    }
  }

  state.outIndex += 2 * pieces.length;

  return true;
}
