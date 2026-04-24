export function createExplosion(x, y, count, speed, color, life, size) {
    const arr = [];
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = speed * (0.3 + Math.random() * 0.7);
        arr.push({
            x, y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            life: life * (0.5 + Math.random() * 0.5),
            maxLife: life,
            r: color[0] + (Math.random() - 0.5) * 0.2,
            g: color[1] + (Math.random() - 0.5) * 0.15,
            b: color[2] + (Math.random() - 0.5) * 0.1,
            size: size * (0.5 + Math.random()),
        });
    }
    return arr;
}

export function renderParticles(draw, gl, particles) {
    for (const p of particles) {
        const alpha = p.life / p.maxLife;
        draw(gl.POINTS, [0, 0], [p.r * alpha, p.g * alpha, p.b * alpha], p.x, p.y, p.size, 0, p.size * 2);
    }
}
