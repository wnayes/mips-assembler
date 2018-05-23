import { IAssemblerState, AssemblerPhase } from "../types";
import { parseImmediate } from "../immediates";

const regexFloat = /^\.float\s+([,-\.\w\s]+)$/i;

/**
 * Writes 32-bit float values.
 * .float value[,...]
 * @param state Current assembler state.
 */
export default function word(state: IAssemblerState): boolean {
  let results = state.line.match(regexFloat);
  if (!results) {
    return false;
  }

  const [, valuesString] = results;
  const pieces = valuesString.split(",")
    .map(s => s.trim())
    .filter(s => !!s);
  const numbers = pieces.map(s => {
    let imm = parseFloat(s);
    if (imm === null)
      throw new Error(`Could not parse .float immediate ${s}`);
    return imm;
  });

  if (state.currentPass === AssemblerPhase.secondPass) {
    for (let i = 0; i < numbers.length; i++) {
      state.dataView.setFloat32(state.outIndex + (i * 4), numbers[i]);
    }
  }

  state.outIndex += 4 * numbers.length;

  return true;
}
