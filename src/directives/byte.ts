import { IAssemblerState, AssemblerPhase } from "../types";
import { parseImmediate } from "../immediates";

const regexByte = /^\.byte\s+([,-\w\s]+)$/i;
const regexDb = /^\.db\s+([,-\w\s]+)$/i;

/**
 * .byte value[,...]
 * .db value[,...]
 * @param state Current assembler state.
 */
export default function byte(state: IAssemblerState): boolean {
  let results = state.line.match(regexByte);
  if (!results) {
    results = state.line.match(regexDb);
    if (!results)
      return false;
  }

  const [, bytesString] = results;
  const pieces = bytesString.split(",")
    .map(s => s.trim())
    .filter(s => !!s);
  const numbers = pieces.map(s => {
    let imm = parseImmediate(s);
    if (imm === null)
      throw new Error(`Could not parse .byte immediate ${s}`);
    return imm;
  });

  if (state.currentPass === AssemblerPhase.secondPass) {
    for (let i = 0; i < numbers.length; i++)
      state.dataView.setInt8(state.outIndex + i, numbers[i]);
  }

  state.outIndex += numbers.length;

  return true;
}
