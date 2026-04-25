export const keys = {};

const printableKeys = new Set([
    'Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0',
    'KeyA','KeyB','KeyC','KeyD','KeyE','KeyF','KeyG','KeyH','KeyI','KeyJ','KeyK','KeyL','KeyM',
    'KeyN','KeyO','KeyP','KeyQ','KeyR','KeyS','KeyT','KeyU','KeyV','KeyW','KeyX','KeyY','KeyZ',
]);

function isPrintable(code) {
    return printableKeys.has(code);
}

function charFromCode(code) {
    return code.replace('Key', '').replace('Digit', '');
}

export function initInput(onStart, onRestart, onNameChar, onNameBackspace, onNameSubmit, onNameSkip) {
    window.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();

        if (e.code === 'Enter' && onNameSubmit) {
            onNameSubmit();
            return;
        }

        if (e.code === 'Backspace' && onNameBackspace) {
            onNameBackspace();
            return;
        }

        if (isPrintable(e.code) && onNameChar) {
            onNameChar(charFromCode(e.code));
            return;
        }

        if (e.code === 'Space') {
            if (onNameSkip && onNameSkip()) return;
            if (onStart && onStart()) return;
            if (onRestart) onRestart();
        }
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });
}
