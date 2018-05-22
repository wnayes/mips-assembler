import { IAssemblerState, AssemblerPhase } from "../types";
import { parseImmediate } from "../immediates";

const regexAscii = /^\.ascii\s+([\\'\",-\w\s]+)$/i;
const regexAsciiZ = /^\.asciiz\s+([\\'\",-\w\s]+)$/i;

/**
 * .ascii value[,...]
 * .asciiz value[,...]
 *
 * `value` can either be a string or byte value.
 * ex: "string"
 * ex: 'string'
 * ex: 0x0A
 *
 * @param state Current assembler state.
 */
export default function ascii(state: IAssemblerState): boolean {
  let appendZero = false;
  let results = state.line.match(regexAscii);
  if (!results) {
    results = state.line.match(regexAsciiZ);
    if (!results)
      return false;
    appendZero = true;
  }

  const [, charsString] = results;
  // const pieces = charsString.split(",")
  //   .map(s => s.trim())
  //   .filter(s => !!s);

  const numbers: number[] = [];

  let currentStrChar = "";
  let currentNumber = "";
  let escaped = false;

  for (let i = 0; i < charsString.length; i++) {
    const char = charsString[i];

    if (!escaped && !currentNumber) {
      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === "\"" || char === "'") {
        if (currentNumber)
          throw new Error("Encountered string during parsing of number: " + currentNumber);

        if (currentStrChar && currentStrChar === char) {
          currentStrChar = ""; // Ending the current string
          continue;
        }
        else if (!currentStrChar) {
          currentStrChar = char;
          continue;
        }
        // else fall through, write the quote character.
        // We're in a situation like "abc'd"
      }
    }

    escaped = false;

    if (currentStrChar) {
      numbers.push(charsString.charCodeAt(i));
      continue;
    }
    else {
      if (/[,\s]+/.test(char)) { // whitespace or comma
        if (currentNumber) {
          let imm = parseImmediate(currentNumber);
          if (imm === null)
            throw new Error(`Could not parse immediate ${currentNumber}`);
          numbers.push(imm);
        }
        currentNumber = "";
      }
      else {
        currentNumber += char;
      }
    }
  }

  if (currentStrChar)
    throw new Error("Unterminated string: " + charsString);

  if (currentNumber) {
    let imm = parseImmediate(currentNumber);
    if (imm === null)
      throw new Error(`Could not parse immediate ${currentNumber}`);
    numbers.push(imm);
  }


  // for (const piece of pieces) {
  //   if (piece[0] === "\"" || piece[0] === "'") {
  //     let str: string = JSON.parse(piece);
  //     if (typeof str !== "string")
  //       throw new Error("Could not parse as string: " + piece);

  //     for (let i = 0; i < str.length; i++) {
  //       numbers.push(str.charCodeAt(i));
  //     }
  //   }
  //   else {
  //     let imm = parseImmediate(piece);
  //     if (imm === null)
  //       throw new Error(`Could not parse immediate ${piece}`);
  //     numbers.push(imm);
  //   }
  // }

  if (appendZero)
    numbers.push(0); // Add NULL byte.

  if (state.currentPass === AssemblerPhase.secondPass) {
    for (let i = 0; i < numbers.length; i++)
      state.dataView.setInt8(state.outIndex + i, numbers[i]);
  }

  state.outIndex += numbers.length;

  return true;
}
