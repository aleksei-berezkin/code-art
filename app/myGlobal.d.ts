declare module '*.shader' {
    const shaderStr: string;
    export default shaderStr;
}

declare interface Window {
    showStub: (details?: string) => void;
    isStubShown?: boolean;
    appDeps: string[],      // webpack define
    appVersion: string,     // webpack define
}
