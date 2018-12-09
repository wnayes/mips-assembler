import { IAssemblerState } from "../state";
import { runFunction } from "../functions";
import { makeBasicDirectiveRegExp } from "./directiveHelpers";
import { AssemblerPhase } from "../types";

const regexInclude = makeBasicDirectiveRegExp("include");

/**
 * .include FileName
 *
 * `FileName` is a key in the `files` object passed to `assemble`.
 *
 * @param state Current assembler state.
 */
export default function include(state: IAssemblerState): boolean {
  if (!state.line.match(regexInclude)) {
    return false;
  }

  if (!state.lineExpressions.length)
    throw new Error("A file name must be passed to an include directive");
  if (state.lineExpressions.length > 1)
    throw new Error("Only a single file name can be passed to an include directive");

  const filename = runFunction(state.lineExpressions[0], state);
  if (filename === null)
    throw new Error("Could not parse .include file name");
  if (typeof filename !== "string")
    throw new Error("File name of include directive must evaluate to a string, saw: " + filename);

  const file = state.files[filename];
  if (typeof file !== "string")
    throw new Error(`The ${filename} file was not a string`);

  if (state.currentPass !== AssemblerPhase.firstPass)
    throw new Error("The `include` directive shouldn't be present after the first assembly phase");

  state.linesToInsert =
`.beginfile
${file}
.endfile`;
  state.line = ""; // Delete this directive.

  return true;
}
