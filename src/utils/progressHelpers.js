export function withProgress(setProgress) {
    return ({ percent }) => setProgress(percent);
}