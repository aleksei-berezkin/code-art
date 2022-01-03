export const blurKernelSize = 29;

const center = Math.floor(blurKernelSize / 2);
const radius = center;

// TODO move both to texture
export const blurKernel: number[] = Array.from({length: blurKernelSize ** 2})
    .map(mapFunc((x, y) => (x**2 + y**2 <= radius**2) ? 1 : 0))

export const blurKernelWeight = blurKernel.reduce((a, b) => a + b, 0);

const sigma = radius / 4;

export const gaussianBlurKernel: number[] = Array.from({length: blurKernelSize ** 2})
    .map(mapFunc((x, y) => 1 / sigma / Math.sqrt(2 * Math.PI) * Math.exp(-(x**2 + y**2) / 2 / sigma**2)));

export const gaussianBlurKernelWeight = gaussianBlurKernel.reduce((a, b) => a + b, 0);

function mapFunc(mapper: (x: number, y: number) => number): (_: unknown, i: number) => number {
    return (_, i) => {
        const row = Math.floor(i / blurKernelSize);
        const col = i % blurKernelSize;
        const x = col - center;
        const y = row - center;
        return mapper(x, y);
    };
}

