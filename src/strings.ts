/**
 * Takes a string like
 * "\"has quotes\""
 * and returns
 * "has quotes"
 * Also handles escape sequences.
 * @returns Parsed string, or null if could not parse.
 */
export function unescapeString(str: string): string | null {
  if (str.length < 2)
    return null;

  const startQuoteChar = str[0];
  if (str[str.length - 1] !== startQuoteChar) {
    return null;
  }
  if (startQuoteChar !== "\"" && startQuoteChar !== "'") {
    return null; // Not a string
  }

  let output = "";
  for (let i = 1; i < str.length - 1; i++) {
    const char = str[i];
    if (char === "\\") {
      const nextChar = str[i + 1];
      const charTwoOver = str[i + 2];
      const charThreeOver = str[i + 3];

      switch (nextChar) {
        case "\\":
        case "\"":
        case "'":
        case "?":
          output += nextChar;
          i++;
          continue;

        case "n":
          output += "\n";
          i++;
          continue;
        case "r":
          output += "\r";
          i++;
          continue;
        case "t":
          output += "\t";
          i++;
          continue;
        case "b":
          output += "\b";
          i++;
          continue;

        case "x":
          if (!isHexDigit(charTwoOver)) {
            throw new Error("Hex escape sequence followed by non-hex character: " + nextChar);
          }
          else {
            // This only supports \xN or \xNN currently.
            if (isHexDigit(charThreeOver)) {
              output += String.fromCharCode(parseInt(charTwoOver + charThreeOver, 16));
              i += 3;
            }
            else {
              output += String.fromCharCode(parseInt(charTwoOver, 16));
              i += 2;
            }
          }
          continue;

        default:
          if (isOctalDigit(nextChar)) {
            if (isOctalDigit(charTwoOver)) {
              if (isOctalDigit(charThreeOver)) {
                // \nnn
                output += String.fromCharCode(parseInt(nextChar + charTwoOver + charThreeOver, 8));
                i += 3;
              }
              else {
                // \nn
                output += String.fromCharCode(parseInt(nextChar + charTwoOver, 8));
                i += 2;
              }
            }
            else {
              // \n
              output += String.fromCharCode(parseInt(nextChar, 8));
              i++;
            }
            continue;
          }
      }
    }
    output += char;
  }

  return output;
}

function isOctalDigit(chr: string): boolean {
  switch (chr) {
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
      return true;
  }
  return false;
}

function isHexDigit(chr: string): boolean {
  switch (chr.toUpperCase()) {
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case "A":
    case "B":
    case "C":
    case "D":
    case "E":
    case "F":
      return true;
  }
  return false;
}

export function firstIndexOf(str: string, ...searchTokens: string[]): number {
  const results = [];

  for (const token of searchTokens) {
    const index = str.indexOf(token);
    if (index >= 0) {
      results.push(index);
    }
  }

  if (results.length === 0) {
    return -1; // Didn't find any search token.
  }

  return Math.min(...results);
}
