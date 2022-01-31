import type { Source } from './souceCode';
import type { CodeColorization, HighlightRequestData, HighlightResponseData } from './highlightProtocol';

const worker = new Worker(new URL('./highlightWorker', import.meta.url));

export async function colorizeCode(source: Source) {
    const cacheKey = source.name;

    if (idToColorizationCache.has(cacheKey)) {
        return idToColorizationCache.get(cacheKey)!;
    }

    const colorization = await highlightInWorker(source.name, source.text);
    idToColorizationCache.set(cacheKey, colorization);
    return colorization;
}

const idToColorizationCache: Map<string, CodeColorization> = new Map();

async function highlightInWorker(id: string, text: string): Promise<CodeColorization> {
    const reqData: HighlightRequestData = {
        id,
        text,
    }
    worker.postMessage(reqData);
    return new Promise(resolve => {
        worker.onmessage = function (resp: {data: HighlightResponseData}) {
            resolve(resp.data.colorization);
        };
    });
}