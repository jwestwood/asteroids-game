import { dist, wrap } from './utils.js';
import { asteroidShape } from './asteroids.js';
import { createExplosion } from './particles.js';
import { keys } from './input.js';
export { keys };

function splitAsteroid(ast, target) {
    const arr = target || state.asteroids;
    if (ast.radius <= 15) return;
    for (let k = 0; k < 2; k++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = 1.5 + Math.random();
        const sz = ast.radius * 0.55;
        const geo = asteroidShape(sz);
        arr.push({
            x: ast.x, y: ast.y,
            vx: Math.cos(ang) * sp + ast.vx * 0.3,
            vy: Math.sin(ang) * sp + ast.vy * 0.3,
            radius: sz, angle: 0,
            rotSpd: (Math.random() - 0.5) * 0.05,
            shape: geo.shape, col: geo.col,
        });
    }
}

export const state = {
    ship: {
        x: 0, y: 0, vx: 0, vy: 0,
        angle: -Math.PI / 2, radius: 18,
        alive: true, invincible: 0, respawn: 0,
    },
    asteroids: [],
    bullets: [],
    particles: [],
    score: 0,
    lives: 3,
    level: 1,
    fireCooldown: 0,
    powerups: [],
    powerupTimer: 0,
    powerupNext: 0,
    activePowerups: { invincible: 0, rapidFire: 0, splitShot: 0, longRange: 0 },
    gameOver: false,
    gameStarted: false,
};

function spawn(count, size, W, H) {
    for (let i = 0; i < count; i++) {
        let x, y;
        do { x = Math.random() * W(); y = Math.random() * H(); }
        while (dist({ x, y }, state.ship) < 150);
        const sp = (1 + Math.random() * 1.5) * (1 + state.level * 0.15);
        const a = Math.random() * Math.PI * 2;
        const geo = asteroidShape(size);
        state.asteroids.push({
            x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            radius: size, angle: 0, rotSpd: (Math.random() - 0.5) * 0.02,
            shape: geo.shape, col: geo.col,
        });
    }
}

export function resetLevel(W, H) {
    state.asteroids = [];
    state.bullets = [];
    state.particles = [];
    state.powerupTimer = 0;
    state.powerupNext = 300 + Math.floor(Math.random() * 900);
    state.activePowerups = { invincible: 0, rapidFire: 0, splitShot: 0, longRange: 0 };
    state.ship.invincible = 180;
    spawn(3 + state.level, 50, W, H);
}

export function resetGame(W, H) {
    state.ship.x = W() / 2;
    state.ship.y = H() / 2;
    state.ship.vx = state.ship.vy = 0;
    state.ship.angle = -Math.PI / 2;
    state.ship.alive = true;
    state.ship.invincible = 180;
    resetLevel(W, H);
}

export function update(W, H) {
    if (!state.gameStarted || state.gameOver) return;

    if (!state.ship.alive) {
        state.ship.respawn--;
        if (state.ship.respawn <= 0) {
            state.ship.alive = true;
            state.ship.x = W() / 2;
            state.ship.y = H() / 2;
            state.ship.vx = state.ship.vy = 0;
            state.ship.angle = -Math.PI / 2;
            state.ship.invincible = Math.max(180, state.activePowerups.invincible);
        }
        return;
    }

    if (keys['ArrowLeft'] || keys['KeyA']) state.ship.angle -= 0.06;
    if (keys['ArrowRight'] || keys['KeyD']) state.ship.angle += 0.06;

    if (keys['ArrowUp'] || keys['KeyW']) {
        state.ship.vx += Math.cos(state.ship.angle) * 0.12;
        state.ship.vy += Math.sin(state.ship.angle) * 0.12;
    }

    state.ship.vx *= 0.995;
    state.ship.vy *= 0.995;
    const spd = Math.sqrt(state.ship.vx * state.ship.vx + state.ship.vy * state.ship.vy);
    if (spd > 8) {
        state.ship.vx = state.ship.vx / spd * 8;
        state.ship.vy = state.ship.vy / spd * 8;
    }

    state.ship.x += state.ship.vx;
    state.ship.y += state.ship.vy;
    wrap(state.ship, W, H);
    if (state.ship.invincible > 0) state.ship.invincible--;

    if (state.fireCooldown > 0) state.fireCooldown--;
    const fireRate = state.activePowerups.rapidFire > 0 ? 2 : 8;
    if (keys['Space'] && state.fireCooldown <= 0) {
        state.fireCooldown = fireRate;
        const angles = state.activePowerups.splitShot > 0
            ? [state.ship.angle, state.ship.angle - 0.35, state.ship.angle + 0.35]
            : [state.ship.angle];
        for (const ang of angles) {
            const spread = ang + (Math.random() - 0.5) * 0.05;
            state.bullets.push({
                x: state.ship.x + Math.cos(spread) * 20,
                y: state.ship.y + Math.sin(spread) * 20,
                vx: Math.cos(spread) * 12 + state.ship.vx * 0.2,
                vy: Math.sin(spread) * 12 + state.ship.vy * 0.2,
                life: state.activePowerups.longRange > 0 ? 200 : 50,
            });
        }
    }

    for (let i = state.bullets.length - 1; i >= 0; i--) {
        state.bullets[i].x += state.bullets[i].vx;
        state.bullets[i].y += state.bullets[i].vy;
        state.bullets[i].life--;
        wrap(state.bullets[i], W, H);
        if (state.bullets[i].life <= 0) state.bullets.splice(i, 1);
    }

    for (const a of state.asteroids) {
        a.x += a.vx;
        a.y += a.vy;
        a.angle += a.rotSpd;
        wrap(a, W, H);
    }
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life--;
        if (p.life <= 0) state.particles.splice(i, 1);
    }

    state.powerupTimer++;
    if (state.powerupTimer >= state.powerupNext) {
        state.powerupTimer = 0;
        state.powerupNext = 300 + Math.floor(Math.random() * 900);
        const count = Math.random() < 0.25 ? 2 : 1;
        const types = ['invincible', 'rapidFire', 'nuke', 'splitShot', 'longRange'];
        for (let n = 0; n < count; n++) {
            const cx = W() / 2 + (Math.random() - 0.5) * W() * 0.8;
            const cy = H() / 2 + (Math.random() - 0.5) * H() * 0.8;
            state.powerups.push({
                x: cx, y: cy,
                type: types[Math.floor(Math.random() * types.length)],
                life: 600,
            });
        }
    }

    // --- Powerup update & collection ---
    for (let i = state.powerups.length - 1; i >= 0; i--) {
        const pw = state.powerups[i];
        pw.life--;
        if (pw.life <= 0) { state.powerups.splice(i, 1); continue; }
        if (dist(state.ship, pw) < state.ship.radius + 16) {
            if (pw.type === 'invincible') {
                state.activePowerups.invincible += 600;
                state.ship.invincible += 600;
            } else if (pw.type === 'rapidFire') {
                state.activePowerups.rapidFire += 720;
            } else if (pw.type === 'nuke') {
                const newAsteroids = [];
                for (const a of state.asteroids) {
                    state.score += a.radius > 30 ? 20 : a.radius > 15 ? 50 : 100;
                    state.particles.push(...createExplosion(a.x, a.y, 20 + a.radius, 3, [1, 1, 1], 35, 4));
                    splitAsteroid(a, newAsteroids);
                }
                state.asteroids = newAsteroids;
            } else if (pw.type === 'splitShot') {
                state.activePowerups.splitShot += 720;
            } else if (pw.type === 'longRange') {
                state.activePowerups.longRange += 720;
            }
            state.particles.push(...createExplosion(pw.x, pw.y, 12, 2, [1, 1, 1], 15, 3));
            state.powerups.splice(i, 1);
        }
    }

    // --- Active powerup timers ---
    if (state.activePowerups.invincible > 0) state.activePowerups.invincible--;
    if (state.activePowerups.rapidFire > 0) state.activePowerups.rapidFire--;
    if (state.activePowerups.splitShot > 0) state.activePowerups.splitShot--;
    if (state.activePowerups.longRange > 0) state.activePowerups.longRange--;

    // --- Bullet vs asteroid collision ---
    for (let i = state.bullets.length - 1; i >= 0; i--) {
        for (let j = state.asteroids.length - 1; j >= 0; j--) {
            if (dist(state.bullets[i], state.asteroids[j]) < Math.max(state.asteroids[j].radius, 24)) {
                const ast = state.asteroids[j];
                state.score += ast.radius > 30 ? 20 : ast.radius > 15 ? 50 : 100;
                state.particles.push(...createExplosion(ast.x, ast.y, 20 + ast.radius, 3, [1, 0.7, 0.3], 30, 3));
                state.particles.push(...createExplosion(ast.x, ast.y, 8, 1.5, [1, 0.4, 0.1], 20, 4));
                splitAsteroid(ast);
                state.asteroids.splice(j, 1);
                state.bullets.splice(i, 1);
                break;
            }
        }
    }

    if (state.ship.invincible <= 0) {
        for (const a of state.asteroids) {
            if (dist(state.ship, a) < state.ship.radius + a.radius - 4) {
                state.lives--;
                state.ship.alive = false;
                state.ship.respawn = 120;
                if (state.lives <= 0) state.gameOver = true;
                state.particles.push(...createExplosion(state.ship.x, state.ship.y, 50, 5, [1, 0.9, 0.5], 45, 4));
                state.particles.push(...createExplosion(state.ship.x, state.ship.y, 30, 3, [1, 0.5, 0.2], 35, 5));
                state.particles.push(...createExplosion(state.ship.x, state.ship.y, 15, 2, [0.5, 0.6, 1], 25, 3));
                break;
            }
        }
    }

    if (state.asteroids.length === 0) {
        state.level++;
        resetLevel(W, H);
    }
}
