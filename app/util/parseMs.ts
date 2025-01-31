export function parseMs(value: string) {
    const m = value.match(/(\d+)\s*ms/)
    return m ? Number(m[1]) : undefined
}
