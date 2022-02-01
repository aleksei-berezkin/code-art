export function delay(ms: number = 10) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
