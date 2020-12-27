/** States of an if/else/endif level. */
export var IfElseStateFlags;
(function (IfElseStateFlags) {
    /** Unused */
    IfElseStateFlags[IfElseStateFlags["None"] = 0] = "None";
    /**
     * We are within an if block, but haven't reached a part we should execute.
     */
    IfElseStateFlags[IfElseStateFlags["AcceptingBlock"] = 1] = "AcceptingBlock";
    /** We are executing code within an if/else block. */
    IfElseStateFlags[IfElseStateFlags["ExecutingBlock"] = 2] = "ExecutingBlock";
    /**
     * We have already executed an if or elseif block, and are passing over
     * remaining instructions.
     */
    IfElseStateFlags[IfElseStateFlags["NoLongerAcceptingBlock"] = 4] = "NoLongerAcceptingBlock";
    /** Flag set once a plain else directive is encountered. */
    IfElseStateFlags[IfElseStateFlags["SawElse"] = 8] = "SawElse";
})(IfElseStateFlags || (IfElseStateFlags = {}));
/** Mask for checking current block state. */
export var IfElseBlockStateMask = IfElseStateFlags.AcceptingBlock
    | IfElseStateFlags.ExecutingBlock
    | IfElseStateFlags.NoLongerAcceptingBlock;
export function setIfElseBlockState(state, newBlockState) {
    state.ifElseStack[state.ifElseStack.length - 1] &= ~IfElseBlockStateMask;
    state.ifElseStack[state.ifElseStack.length - 1] |= newBlockState;
}
