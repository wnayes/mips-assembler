/** Current memory address */
export function org(state, value) {
    return state.memPos + state.outIndex;
}
;
