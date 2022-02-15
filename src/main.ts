import App from './App.svelte';
import { checkApi } from './checkApi';

if (!window.isStubShown) {
    if (checkApi()) {
        new App({
            target: document.body,
        });
    } else {
        window.showStub();
    }
}
