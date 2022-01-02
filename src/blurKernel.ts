export const blurKernelSize = 19;

const center = Math.floor(blurKernelSize / 2);
const r = center;

export const blurKernel: number[] = Array.from({length: blurKernelSize ** 2})
    .map((_, i) => {
        const row = Math.floor(i / blurKernelSize);
        const col = i % blurKernelSize;
        const x = col - center;
        const y = row - center;
        return (x**2 + y**2 <= r**2) ? 1 : 0;
    });

export const blurKernelWeight = blurKernel.reduce((a, b) => a + b, 0);
