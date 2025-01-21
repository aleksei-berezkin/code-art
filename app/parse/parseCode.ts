import type { ParseRequestData, ParseResponseData } from './parseProtocol';
import type { ParseResult } from '../model/ParseResult';

const worker = new Worker(new URL('./parseWorker', import.meta.url));

export async function parseCode(url: string, insertWraps: boolean) {
    const key = JSON.stringify([url, insertWraps]);
    if (parseResultCache.has(key)) {
        return parseResultCache.get(key)!;
    }

    const parseResult = await parseInWorker(url, insertWraps);
    parseResultCache.set(key, parseResult);
    return parseResult;
}

const parseResultCache: Map<string, ParseResult> = new Map();

async function parseInWorker(url: string, insertWraps: boolean): Promise<ParseResult> {
    const reqData: ParseRequestData = {url, insertWraps};
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
