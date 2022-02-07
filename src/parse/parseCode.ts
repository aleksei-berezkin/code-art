import type { ParseRequestData, ParseResponseData } from './parseProtocol';
import type { ParseResult } from '../model/ParseResult';

const worker = new Worker(new URL('./parseWorker', import.meta.url));

export async function parseCode(url: string, softWraps: boolean) {
    const key = JSON.stringify([url, softWraps]);
    if (parseResultCache.has(key)) {
        return parseResultCache.get(key)!;
    }

    const parseResult = await parseInWorker(url, softWraps);
    parseResultCache.set(key, parseResult);
    return parseResult;
}

const parseResultCache: Map<string, ParseResult> = new Map();

async function parseInWorker(url: string, softWraps: boolean): Promise<ParseResult> {
    const reqData: ParseRequestData = {url, softWraps};
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
