export function checkApi() {
    return window.Promise
        // @ts-ignore
        && Promise.resolve().finally
        // @ts-ignore
        && window.fetch
        // @ts-ignore
        && window.requestAnimationFrame
        // @ts-ignore
        && Object.entries
        // @ts-ignore
        && Object.fromEntries
        // @ts-ignore
        && [].flatMap
        && window.Map
        && window.Set
        && window.Worker
        && window.URL
        && document.fonts.load
        ;
}
