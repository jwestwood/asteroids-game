import { createExplosion } from './particles.js';

const ASTEROID_LEVELS = {
    1: {
        childCount: 2, spMin: 1.5, spMax: 2.5, szMult: 0.55, velInherit: 0.3, rotSpdMax: 0.03,
        bodyColor: { r: [0.8, 1], g: [0.4, 0.5], b: [0, 0.1] },
        explosionColors: [[1, 0.7, 0.3], [1, 0.4, 0.1]],
    },
    2: {
        childCount: 4, spMin: 3, spMax: 5, szMult: 0.5, velInherit: 0.4, rotSpdMax: 0.07,
        bodyColor: { r: [0.8, 0.9], g: [0.2, 0.3], b: [0.5, 0.6] },
        explosionColors: [[0.9, 0.3, 0.5], [1, 0.5, 0.6]],
    },
    3: {
        childCount: 6, spMin: 2, spMax: 4, szMult: 0.4, velInherit: 0.5, rotSpdMax: 0.12,
        bodyColor: { r: [0.1, 0.5], g: [0.8, 1], b: [0.8, 1] },
        explosionColors: [[1, 0.1, 0.1], [1, 0.3, 0.2]],
    },
};

function getAsteroidConfig(level) {
    return ASTEROID_LEVELS[level] || ASTEROID_LEVELS[1];
}

export class Asteroid {
    constructor(x, y, vx, vy, radius, asteroidLevel = 1) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.angle = 0;
        this.asteroidLevel = asteroidLevel;
        const cfg = getAsteroidConfig(asteroidLevel);
        this.rotSpd = (Math.random() - 0.5) * cfg.rotSpdMax;
        const geo = asteroidGen(radius, asteroidLevel);
        this.shape = geo.shape;
        this.col = geo.col;
    }

    update(W, H) {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.rotSpd;
    }

    getScore() {
        const base = this.radius > 30 ? 20 : (this.radius > 15 ? 50 : 100);
        return base * this.asteroidLevel;
    }

    split() {
        if (this.radius <= 15) return [];
        const cfg = getAsteroidConfig(this.asteroidLevel);
        const children = [];
        for (let k = 0; k < cfg.childCount; k++) {
            const ang = Math.random() * Math.PI * 2;
            const sp = cfg.spMin + Math.random() * (cfg.spMax - cfg.spMin);
            const child = new Asteroid(
                this.x, this.y,
                Math.cos(ang) * sp + this.vx * cfg.velInherit,
                Math.sin(ang) * sp + this.vy * cfg.velInherit,
                this.radius * cfg.szMult,
                this.asteroidLevel
            );
            child.rotSpd = (Math.random() - 0.5) * cfg.rotSpdMax;
            children.push(child);
        }
        return children;
    }

    static createBulletExplosion(x, y, radius, asteroidLevel) {
        const cfg = getAsteroidConfig(asteroidLevel);
        const [c1, c2] = cfg.explosionColors;
        return [
            ...createExplosion(x, y, 20 + radius, 3, c1, 30, 2),
            ...createExplosion(x, y, 8, 1.5, c2, 20, 3),
        ];
    }

    static createShieldExplosion(x, y, radius) {
        return [
            ...createExplosion(x, y, 20 + radius, 3, [0.3, 0.8, 1], 30, 2),
            ...createExplosion(x, y, 8, 1.5, [0.5, 0.9, 1], 20, 3),
        ];
    }

    static createNukeExplosion(x, y, radius) {
        return createExplosion(x, y, 20 + radius, 3, [1, 1, 1], 35, 3);
    }
}

function asteroidGen(size, level) {
    const v = [], c = [];
    const n = 12 + Math.floor(Math.random() * 6);
    const colors = getAsteroidConfig(level).bodyColor;
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = size * (0.6 + Math.random() * 0.4);
        v.push(Math.cos(a) * r, Math.sin(a) * r);
        c.push(
            colors.r[0] + Math.random() * (colors.r[1] - colors.r[0]),
            colors.g[0] + Math.random() * (colors.g[1] - colors.g[0]),
            colors.b[0] + Math.random() * (colors.b[1] - colors.b[0])
        );
    }
    return { shape: v, col: c };
}

export function renderAsteroids(draw, gl, asteroids) {
    for (const a of asteroids) {
        draw(gl.LINE_LOOP, a.shape, a.col, a.x, a.y, 1, a.angle);
    }
}
