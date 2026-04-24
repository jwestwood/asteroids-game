export function asteroidShape(size) {
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

export function renderAsteroids(draw, gl, asteroids) {
    for (const a of asteroids) {
        draw(gl.LINE_LOOP, a.shape, a.col, a.x, a.y, 1, a.angle);
    }
}
