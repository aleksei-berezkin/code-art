import type { ShortColorKey } from './ShortColorKey';

// index = pos in text
export type CodeColorization = ShortColorKey[];

export type HighlightRequestData = {
    url: string,
};

export type HighlightResponseData = {
    url: string,
    colorization: CodeColorization,
};
