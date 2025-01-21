type Entries<O> = { [K in keyof O]: [K, O[K]] }[keyof O][]

declare const oo: {a:1} | {b: 2}

declare const kk: keyof typeof oo

export function typedEntries<O extends {}>(obj: O): Entries<O> {
    return Object.entries(obj) as Entries<O>;
}
