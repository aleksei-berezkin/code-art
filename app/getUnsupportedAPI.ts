export function getUnsupportedAPI() {
    if (!window.Promise) {
        return 'Promise';
    }
    if (!Promise.resolve().finally) {
        return 'Promise.finally';
    }
    if (!window.fetch) {
        return 'fetch';
    }
    if (!window.requestAnimationFrame) {
        return 'requestAnimationFrame';
    }
    if (!Object.entries) {
        return 'Object.entries';
    }
    if (!Object.fromEntries) {
        return 'Object.fromEntries';
    }
    if (![].flatMap) {
        return 'Array.flatMap';
    }
    if (!window.Map) {
        return 'Map';
    }
    if (!window.Set) {
        return 'Set';
    }
    if (!window.URL) {
        return 'URL';
    }
    if (!window.Worker) {
        return 'Worker';
    }
    if (!document.fonts?.load) {
        return 'document.fonts.load';
    }
    return undefined;
}
