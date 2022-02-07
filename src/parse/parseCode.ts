import type { ParseRequestData, ParseResponseData } from './parseProtocol';
import type { ParseResult } from '../model/ParseResult';

const worker = new Worker(new URL('./parseWorker', import.meta.url));

export async function parseCode(url: string) {
    if (parseResultCache.has(url)) {
        return parseResultCache.get(url)!;
    }

    const parseResult = await parseInWorker(url);
    parseResultCache.set(url, parseResult);
    return parseResult;
}

const parseResultCache: Map<string, ParseResult> = new Map();

async function parseInWorker(url: string): Promise<ParseResult> {
    const reqData: ParseRequestData = {url};
    return new Promise(resolve => {
        // One at a time
        worker.onmessage = function (resp: {data: ParseResponseData}) {
            if (resp.data.url === url) {
                resolve(resp.data.parseResult);
            }
        };
        worker.postMessage(reqData);
    });
}
