export function createCloseBehavior() {
    let windowClickListener: ((e: MouseEvent) => void) | undefined;
    let keyDownHandler: ((e: KeyboardEvent) => void) | undefined; 

    const closeBehavior = {
        isAttached() {
            return windowClickListener != null;
        },

        // Event is still processing, defer
        attachDeferred(target: HTMLElement, close: () => void) {
            setTimeout(() => {
                closeBehavior.detach();

                windowClickListener = function (e: MouseEvent) {
                    if ((e.target as Node | null)?.nodeType && target.contains(e.target as Node)) {
                        // inside
                        return;
                    }
    
                    close();
                };
    
                keyDownHandler = function (e: KeyboardEvent) {
                    if (e.key === 'Escape') {
                        close();
                    }
                }
    
                document.addEventListener('click', windowClickListener);
                document.addEventListener('keydown', keyDownHandler);
            });
        },

        detach() {
            if (windowClickListener) {
                document.removeEventListener('click', windowClickListener);
                windowClickListener = undefined;
            }
            if (keyDownHandler) {
                document.removeEventListener('keydown', keyDownHandler);
                keyDownHandler = undefined;
            }
        },
    };
    return closeBehavior;
}
