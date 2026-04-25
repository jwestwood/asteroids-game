export function dist(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function wrap(o, W, H) {
    if (o.x < -50) o.x += W() + 100;
    if (o.x > W() + 50) o.x -= W() + 100;
    if (o.y < -50) o.y += H() + 100;
    if (o.y > H() + 50) o.y -= H() + 100;
}

export function buildCol(n, r, g, b) {
    const c = [];
    for (let i = 0; i < n; i++) c.push(r, g, b);
    return c;
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

export function randRange(min, max) {
    return min + Math.random() * (max - min);
}

export function randAngle() {
    return Math.random() * Math.PI * 2;
}
