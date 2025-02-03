export async function genAll<Item>(generatorFn: () => AsyncGenerator<Item>) {
    const items = []
    for await (const item of generatorFn()) {
        items.push(item)
    }
    return items
}
