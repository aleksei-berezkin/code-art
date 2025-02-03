type Entries<O> = { [K in keyof O]: [K, O[K]] }[keyof O][]

export function typedEntries<O extends object>(obj: O): Entries<O> {
    return Object.entries(obj) as Entries<O>
}
