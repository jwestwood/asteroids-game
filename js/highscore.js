const STORAGE_KEY = 'asteroids_highscores';
const MAX_HIGHSCORES = 10;

function load() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function save(list) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch { /* ignore */ }
}

export function getHighscores() {
    return load();
}

export function addHighscore(name, score) {
    const list = load();
    list.push({ name: name.substring(0, 12), score });
    list.sort((a, b) => b.score - a.score);
    const trimmed = list.slice(0, MAX_HIGHSCORES);
    save(trimmed);
    return trimmed;
}

export function getTopN(n) {
    return load().slice(0, n);
}