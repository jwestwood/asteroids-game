let highscores = [];
let loading = false;

export function getHighscores() {
    return highscores;
}

export function isLoading() {
    return loading;
}

export async function fetchHighscores() {
    loading = true;
    try {
        const res = await fetch('/api/highscores');
        if (res.ok) {
            highscores = await res.json();
        }
    } catch {
        // Server not available, use empty list
        highscores = [];
    }
    loading = false;
}

export async function addHighscore(name, score) {
    try {
        const res = await fetch('/api/highscores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, score }),
        });
        if (res.ok) {
            await fetchHighscores();
        }
    } catch {
        // Server not available
    }
}
