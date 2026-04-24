import { dist, wrap } from './utils.js';
import { asteroidShape } from './asteroids.js';
import { createExplosion } from './particles.js';
import { keys } from './input.js';
export { keys };

export const ship = {
    x: 0, y: 0, vx: 0, vy: 0,
    angle: -Math.PI / 2, radius: 18,
    alive: true, invincible: 0, respawn: 0,
};

export let asteroids = [];
export let bullets = [];
export let particles = [];
export let score = 0, lives = 3, level = 1;
export let gameOver = false, gameStarted = false;

function spawn(count, size, W, H) {
    for (let i = 0; i < count; i++) {
        let x, y;
        do { x = Math.random() * W(); y = Math.random() * H(); }
        while (dist({ x, y }, ship) < 150);
        const sp = (1 + Math.random() * 1.5) * (1 + level * 0.15);
        const a = Math.random() * Math.PI * 2;
        const geo = asteroidShape(size);
        asteroids.push({
            x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            radius: size, angle: 0, rotSpd: (Math.random() - 0.5) * 0.02,
            shape: geo.shape, col: geo.col,
        });
    }
}

export function resetLevel(W, H) {
    asteroids = [];
    bullets = [];
    particles = [];
    spawn(3 + level, 50, W, H);
}

export function resetGame(W, H) {
    ship.x = W() / 2;
    ship.y = H() / 2;
    ship.vx = ship.vy = 0;
    ship.angle = -Math.PI / 2;
    ship.alive = true;
    ship.invincible = 180;
    resetLevel(W, H);
}

export function update(W, H) {
    if (!gameStarted || gameOver) return;

    if (!ship.alive) {
        ship.respawn--;
        if (ship.respawn <= 0) {
            ship.alive = true;
            ship.x = W() / 2;
            ship.y = H() / 2;
            ship.vx = ship.vy = 0;
            ship.angle = -Math.PI / 2;
            ship.invincible = 180;
        }
        return;
    }

    if (keys['ArrowLeft'] || keys['KeyA']) ship.angle -= 0.06;
    if (keys['ArrowRight'] || keys['KeyD']) ship.angle += 0.06;

    if (keys['ArrowUp'] || keys['KeyW']) {
        ship.vx += Math.cos(ship.angle) * 0.12;
        ship.vy += Math.sin(ship.angle) * 0.12;
    }

    ship.vx *= 0.995;
    ship.vy *= 0.995;
    const spd = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
    if (spd > 8) {
        ship.vx = ship.vx / spd * 8;
        ship.vy = ship.vy / spd * 8;
    }

    ship.x += ship.vx;
    ship.y += ship.vy;
    wrap(ship, W, H);
    if (ship.invincible > 0) ship.invincible--;

    if (keys['Space'] && !keys._shot) {
        keys._shot = true;
        bullets.push({
            x: ship.x + Math.cos(ship.angle) * 20,
            y: ship.y + Math.sin(ship.angle) * 20,
            vx: Math.cos(ship.angle) * 12 + ship.vx * 0.2,
            vy: Math.sin(ship.angle) * 12 + ship.vy * 0.2,
            life: 50,
        });
    }
    if (!keys['Space']) keys._shot = false;

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bullets[i].vx;
        bullets[i].y += bullets[i].vy;
        bullets[i].life--;
        wrap(bullets[i], W, H);
        if (bullets[i].life <= 0) bullets.splice(i, 1);
    }

    for (const a of asteroids) {
        a.x += a.vx;
        a.y += a.vy;
        a.angle += a.rotSpd;
        wrap(a, W, H);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (dist(bullets[i], asteroids[j]) < asteroids[j].radius) {
                const ast = asteroids[j];
                score += ast.radius > 30 ? 20 : ast.radius > 15 ? 50 : 100;
                particles.push(...createExplosion(ast.x, ast.y, 20 + ast.radius, 3, [1, 0.7, 0.3], 30, 3));
                particles.push(...createExplosion(ast.x, ast.y, 8, 1.5, [1, 0.4, 0.1], 20, 4));
                if (ast.radius > 15) {
                    for (let k = 0; k < 2; k++) {
                        const a = Math.random() * Math.PI * 2;
                        const sp = 1.5 + Math.random();
                        const sz = ast.radius * 0.55;
                        const geo = asteroidShape(sz);
                        asteroids.push({
                            x: ast.x, y: ast.y,
                            vx: Math.cos(a) * sp + ast.vx * 0.3,
                            vy: Math.sin(a) * sp + ast.vy * 0.3,
                            radius: sz, angle: 0,
                            rotSpd: (Math.random() - 0.5) * 0.05,
                            shape: geo.shape, col: geo.col,
                        });
                    }
                }
                asteroids.splice(j, 1);
                bullets.splice(i, 1);
                break;
            }
        }
    }

    if (ship.invincible <= 0) {
        for (const a of asteroids) {
            if (dist(ship, a) < ship.radius + a.radius - 4) {
                lives--;
                ship.alive = false;
                ship.respawn = 120;
                if (lives <= 0) gameOver = true;
                particles.push(...createExplosion(ship.x, ship.y, 50, 5, [1, 0.9, 0.5], 45, 4));
                particles.push(...createExplosion(ship.x, ship.y, 30, 3, [1, 0.5, 0.2], 35, 5));
                particles.push(...createExplosion(ship.x, ship.y, 15, 2, [0.5, 0.6, 1], 25, 3));
                break;
            }
        }
    }

    if (asteroids.length === 0) {
        level++;
        resetLevel(W, H);
    }
}
