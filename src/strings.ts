/**
 * Takes a string like
 * "\"has quotes\""
 * and returns
 * "has quotes"
 * @returns Parsed string, or null if could not parse.
 */
export function unescapeQuotes(str: string): string | null {
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
      switch (nextChar) {
        case "\\":
        case "\"":
        case "'":
          output += nextChar;
          i++;
          continue;
      }
    }
    output += char;
  }

  return output;
}
