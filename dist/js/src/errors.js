export function throwError(message, state) {
    throw new Error(message + "\nLine: " + state.line);
}
