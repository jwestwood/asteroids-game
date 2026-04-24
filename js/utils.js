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
