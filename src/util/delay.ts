export function delay(ms: number = 6) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
