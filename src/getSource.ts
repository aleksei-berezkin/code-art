let text: undefined | string = undefined;

export async function getSource() {
    if (text) {
        return text;
    }
    const r = await fetch('https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js');
    if (text) {
        return text;
    }
    text = await r.text();
    return text;
}
