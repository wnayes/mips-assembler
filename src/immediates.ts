export function parseImmediate(value: string): number | null {
  if (typeof value !== "string")
    return null;

  let negative = value[0] === "-";
  if (negative)
    value = value.substr(1);

  let result;
  if (value[0] === "b" || value[0] === "0" && value[1] === "b")
    result = parseInt(value.substr(2), 2);
  else if (value[0] === "o" || value[0] === "0" && value[1] === "o")
    result =  parseInt(value.substr(2), 8);
  else if (value[0] === "x" || value[0] === "0" && value[1] === "x")
    result = parseInt(value.substr(2), 16);
  else
    result = parseInt(value, 10);

  if (isNaN(result))
    return null;

  if (negative)
    result = -result;

  return result;
}