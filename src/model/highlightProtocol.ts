import type { ShortColorKey } from './ShortColorKey';

// index = pos in text
export type CodeColorization = ShortColorKey[];

export type HighlightRequestData = {
    id: string,
    text: string,
};

export type HighlightResponseData = {
    id: string,
    colorization: CodeColorization,
};
