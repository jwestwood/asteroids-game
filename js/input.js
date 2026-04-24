export const keys = {};

export function initInput(onStart, onRestart) {
    window.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
        if (e.code === 'Space') {
            if (onStart && !onStart()) return;
            if (onRestart) onRestart();
        }
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });
}
