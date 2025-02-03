export function getFromSelfOrParentDataset(el: HTMLElement | null, key: string) {
    while (el) {
        if (el.dataset[key]) {
            return el.dataset[key]
        }
        el = el.parentElement
    }
}
