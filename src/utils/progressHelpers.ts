export interface ProgressEvent {
    percent: number;
}

export function withProgress(setProgress: (percent: number) => void) {
    return ({ percent }: ProgressEvent) => setProgress(percent);
}
