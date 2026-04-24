import { initWebGL } from './webgl.js';
import { initInput } from './input.js';
import { renderShip } from './ship.js';
import { renderAsteroids } from './asteroids.js';
import { renderBullets } from './bullets.js';
import { renderHUD } from './hud.js';
import * as game from './game.js';

const glCanvas = document.getElementById('g');
const hudCanvas = document.getElementById('hud');
const { gl, draw } = initWebGL(glCanvas);
const ctx = hudCanvas.getContext('2d');

function resize() {
    glCanvas.width = hudCanvas.width = window.innerWidth;
    glCanvas.height = hudCanvas.height = window.innerHeight;
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
}
window.addEventListener('resize', resize);
resize();

const stars = [];
for (let i = 0; i < 250; i++) {
    stars.push({
        x: Math.random() * 3000,
        y: Math.random() * 2000,
        s: 0.5 + Math.random() * 1.5,
        b: 0.2 + Math.random() * 0.8,
    });
}

const W = () => glCanvas.width;
const H = () => glCanvas.height;

let started = false;
initInput(
    () => {
        if (!started) {
            started = true;
            game.gameStarted = true;
            game.resetGame(W, H);
            return true;
        }
        return false;
    },
    () => {
        if (game.gameOver) {
            game.gameOver = false;
            game.score = 0;
            game.lives = 3;
            game.level = 1;
            game.resetLevel(W, H);
        }
    }
);

function renderGL() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (const s of stars) {
        draw(gl.POINTS, [0, 0], [s.b, s.b, s.b], s.x % W(), s.y % H(), s.s, 0);
    }

    renderShip(draw, gl, game.ship, game.keys);
    renderBullets(draw, gl, game.bullets);
    renderAsteroids(draw, gl, game.asteroids);

    for (const p of game.particles) {
        const alpha = p.life / p.maxLife;
        draw(gl.POINTS, [0, 0], [p.r * alpha, p.g * alpha, p.b * alpha], p.x, p.y, p.size, 0);
    }
}

function loop() {
    game.update(W, H);
    renderGL();
    renderHUD(ctx, W, H, game.gameStarted, game.gameOver, game.score, game.level, game.lives);
    requestAnimationFrame(loop);
}
loop();
