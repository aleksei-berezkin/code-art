import { parseCode } from '../parse/parseCode';
import type { ParseResult } from './ParseResult';
import { type SourceSpec, sourceSpecs } from './sourceSpecs';

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
