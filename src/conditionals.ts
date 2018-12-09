import { IAssemblerState } from "./state";

/** States of an if/else/endif level. */
export enum IfElseStateFlags {
  /** Unused */
  None,

  /**
   * We are within an if block, but haven't reached a part we should execute.
   */
  AcceptingBlock = 1,

  /** We are executing code within an if/else block. */
  ExecutingBlock = 2,

  /**
   * We have already executed an if or elseif block, and are passing over
   * remaining instructions.
   */
  NoLongerAcceptingBlock = 4,

  /** Flag set once a plain else directive is encountered. */
  SawElse = 8,
}

/** Mask for checking current block state. */
export const IfElseBlockStateMask =
  IfElseStateFlags.AcceptingBlock
  | IfElseStateFlags.ExecutingBlock
  | IfElseStateFlags.NoLongerAcceptingBlock;

type BlockState = IfElseStateFlags.AcceptingBlock
  | IfElseStateFlags.ExecutingBlock
  | IfElseStateFlags.NoLongerAcceptingBlock;

export function setIfElseBlockState(state: IAssemblerState, newBlockState: BlockState): void {
  state.ifElseStack[state.ifElseStack.length - 1] &= ~IfElseBlockStateMask;
  state.ifElseStack[state.ifElseStack.length - 1] |= newBlockState;
}