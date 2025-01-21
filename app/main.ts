import App from './App.svelte';
import { getUnsupportedAPI } from './getUnsupportedAPI';

if (!window.isStubShown) {
    const unsupportedApi = getUnsupportedAPI();
    if (unsupportedApi) {
        window.showStub(`not supported ${unsupportedApi}`);
    } else {
        new App({
            target: document.body,
        });
    }
}
