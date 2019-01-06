import { IAssemblerState } from "./state";

export function throwError(message: string, state: IAssemblerState): never {
  throw new Error(message + "\nLine: " + state.line);
}
