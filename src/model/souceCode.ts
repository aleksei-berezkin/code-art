import type { Lang } from './Lang';
import type { WorkLimiter } from '../util/workLimiter';
import { parseCode } from '../parse/parseCode';
import type { ParseResult } from './ParseResult';
import { SourceSpec, sourceSpecs } from './sourceSpecs';

export type Source = {
    name: string,
    spec: SourceSpec,
    text: string,
    parseResult: ParseResult,
}

export async function getSource(name: string): Promise<Source> {
    const spec = sourceSpecs[name];
    const parseResult = await parseCode(spec.url, spec.lang === 'js min line');

    // This is already fetched in worked so is cached
    const text = await (await fetch(sourceSpecs[name].url)).text();

    return {
        name,
        spec,
        text,
        parseResult,
    };
}
