export const defaultMonospace = 'Browser default mono';

export const fontFaces = [
    'Anonymous Pro',
    'Courier Prime',
    'Cutive Mono',
    'B612 Mono',
    'Inconsolata',
    'JetBrains Mono',
    'Noto Sans Mono',
    'Nova Mono',
    'Syne Mono',
    'Share Tech Mono',
    'Ubuntu Mono',
    defaultMonospace,
];

export const fontFacesForRandomScenes = fontFaces
    .filter(f => ![defaultMonospace].includes(f));
