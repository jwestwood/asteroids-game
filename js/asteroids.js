import { createExplosion } from './particles.js';

export class Asteroid {
    constructor(x, y, vx, vy, radius, isClusteroid = false, isIndestructible = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.angle = 0;
        this.rotSpd = (Math.random() - 0.5) * 0.02;
        this.isClusteroid = isClusteroid;
        this.isIndestructible = isIndestructible;
        const geo = isIndestructible ? indestructibleGen(radius) : (isClusteroid ? clusteroidGen(radius) : asteroidGen(radius));
        this.shape = geo.shape;
        this.col = geo.col;
    }

    update(W, H) {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.rotSpd;
    }

    getScore() {
        if (this.radius > 30) return 20;
        if (this.radius > 15) return 50;
        return 100;
    }

    split() {
        if (this.radius <= 15) return [];
        const count = this.isClusteroid ? 4 : 2;
        const spMin = this.isClusteroid ? 3 : 1.5;
        const spMax = this.isClusteroid ? 5 : 2.5;
        const szMult = this.isClusteroid ? 0.5 : 0.55;
        const velInherit = this.isClusteroid ? 0.4 : 0.3;
        const rotSpdMax = this.isClusteroid ? 0.06 : 0.05;

        const children = [];
        for (let k = 0; k < count; k++) {
            const ang = Math.random() * Math.PI * 2;
            const sp = spMin + Math.random() * (spMax - spMin);
            const child = new Asteroid(
                this.x, this.y,
                Math.cos(ang) * sp + this.vx * velInherit,
                Math.sin(ang) * sp + this.vy * velInherit,
                this.radius * szMult,
                this.isClusteroid,
                this.isIndestructible
            );
            child.rotSpd = (Math.random() - 0.5) * rotSpdMax;
            children.push(child);
        }
        return children;
    }

    static createBulletExplosion(x, y, radius, isClusteroid) {
        if (isClusteroid) {
            return [
                ...createExplosion(x, y, 20 + radius, 3, [0.9, 0.3, 0.5], 30, 2),
                ...createExplosion(x, y, 8, 1.5, [1, 0.5, 0.6], 20, 3),
            ];
        }
        return [
            ...createExplosion(x, y, 20 + radius, 3, [1, 0.7, 0.3], 30, 2),
            ...createExplosion(x, y, 8, 1.5, [1, 0.4, 0.1], 20, 3),
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

function asteroidGen(size) {
    const v = [], c = [];
    const n = 12 + Math.floor(Math.random() * 6);
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = size * (0.6 + Math.random() * 0.4);
        v.push(Math.cos(a) * r, Math.sin(a) * r);
        const h = 0.35 + Math.random() * 0.15;
        c.push(h + 0.15, h + 0.1, h);
    }
    return { shape: v, col: c };
}

function indestructibleGen(size) {
    const v = [], c = [];
    const n = 10 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = size * (0.7 + Math.random() * 0.3);
        v.push(Math.cos(a) * r, Math.sin(a) * r);
        c.push(0.9 + Math.random() * 0.1, 0.85 + Math.random() * 0.1, 0.1 + Math.random() * 0.1);
    }
    return { shape: v, col: c };
}

function clusteroidGen(size) {
    const v = [], c = [];
    const n = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = size * (0.5 + Math.random() * 0.5);
        v.push(Math.cos(a) * r, Math.sin(a) * r);
        c.push(0.7 + Math.random() * 0.3, 0.2 + Math.random() * 0.15, 0.3 + Math.random() * 0.2);
    }
    return { shape: v, col: c };
}

export function renderAsteroids(draw, gl, asteroids) {
    for (const a of asteroids) {
        draw(gl.LINE_LOOP, a.shape, a.col, a.x, a.y, 1, a.angle);
    }
}
