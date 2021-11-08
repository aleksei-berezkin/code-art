export function loadImage(src: string) {
    return new Promise<HTMLImageElement>(resolve => {
        const img = new Image();
        img.src = src;
        img.onload = function() {
            resolve(img);
        }
    })
}
