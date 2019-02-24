import { IAssemblerState } from "../state";
import { runFunction } from "../functions";
import { basicDirectiveMatcher } from "./directiveHelpers";
import { AssemblerPhase } from "../types";
import { throwError } from "../errors";

/**
 * .include FileName
 *
 * `FileName` is a key in the `files` object passed to `assemble`.
 *
 * @param state Current assembler state.
 */
export default function include(state: IAssemblerState): void {
  if (!state.lineExpressions.length)
    throwError("A file name must be passed to an include directive", state);
  if (state.lineExpressions.length > 1)
    throwError("Only a single file name can be passed to an include directive", state);

  const filename = runFunction(state.lineExpressions[0], state);
  if (filename === null)
    throwError("Could not parse .include file name", state);
  if (typeof filename !== "string") {
    throwError("File name of include directive must evaluate to a string, saw: " + filename, state);
    return;
  }

  const file = state.files[filename];
  if (typeof file !== "string")
    throwError(`The ${filename} file was not a string`, state);

  if (state.currentPass !== AssemblerPhase.firstPass) {
    throwError("The `include` directive shouldn't be present after the first assembly phase", state);
    return;
  }

  state.linesToInsert =
`.beginfile
${file}
.endfile`;
  state.line = ""; // Delete this directive.
}
include.matches = basicDirectiveMatcher("include");
