export async function delay(ms: number = 10) {
    await new Promise(resolve => setTimeout(resolve, ms));
}
