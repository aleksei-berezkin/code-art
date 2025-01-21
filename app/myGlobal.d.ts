declare module '*.shader' {
    export default '' as string
}

declare interface Window {
    showStub: (details?: string) => void;
    isStubShown?: boolean;
}
