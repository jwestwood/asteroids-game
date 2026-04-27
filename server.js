const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'highscores.json');

app.use(express.json());
app.use(express.static('.'));

function readScores() {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function writeScores(scores) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(scores, null, 2), 'utf8');
}

app.get('/api/highscores', (req, res) => {
    const scores = readScores();
    scores.sort((a, b) => b.score - a.score);
    res.json(scores.slice(0, 10));
});

app.post('/api/highscores', (req, res) => {
    const { name, score } = req.body;

    if (!name || score == null) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const scores = readScores();
    scores.push({ name: name.substring(0, 12).toUpperCase(), score });
    scores.sort((a, b) => b.score - a.score);
    writeScores(scores);
    console.log(`[HIGHSCORE] Accepted "${name}": ${score}`);
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
