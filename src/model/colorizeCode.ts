import type { CodeColorization, HighlightRequestData, HighlightResponseData } from './highlightProtocol';

const worker = new Worker(new URL('./highlightWorker', import.meta.url));

export async function colorizeCode(url: string) {
    if (idToColorizationCache.has(url)) {
        return idToColorizationCache.get(url)!;
    }

    const colorization = await highlightInWorker(url);
    idToColorizationCache.set(url, colorization);
    return colorization;
}

const idToColorizationCache: Map<string, CodeColorization> = new Map();

async function highlightInWorker(url: string): Promise<CodeColorization> {
    const reqData: HighlightRequestData = {url};
    return new Promise(resolve => {
        // One at a time
        worker.onmessage = function (resp: {data: HighlightResponseData}) {
            if (resp.data.url === url) {
                resolve(resp.data.colorization);
            }
        };
        worker.postMessage(reqData);
    });
}