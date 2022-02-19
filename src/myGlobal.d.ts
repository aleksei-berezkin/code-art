declare module '*.shader' {
    const shaderStr: string;
    export default shaderStr;
}

declare interface Window {
    showStub: () => void;
    isStubShown?: boolean;
    appDeps: string[],  // webpack define
}
