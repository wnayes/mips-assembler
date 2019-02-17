import { IAssemblerState } from "../state";

/** Current memory address */
export function org(state: IAssemblerState, value: string | number): number {
  return state.memPos + state.outIndex;
};
