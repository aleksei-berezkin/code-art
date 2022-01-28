import type { IsInterrupted } from './interrupted';
import { interrupted } from './interrupted';

export async function delay(isInterrupted: IsInterrupted) {
    await new Promise(resolve => setTimeout(resolve));
    if (isInterrupted()) {
        throw interrupted;
    }
}
