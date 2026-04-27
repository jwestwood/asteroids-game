const bulletShape = [0, -5, 4, -2, 0, 5, -4, -2];
const bulletGlow = [0, -7, 6, -3, 0, 7, -6, -3];

export class Bullet {
    constructor(x, y, vx, vy, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
    }

    update(W, H) {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    get dead() {
        return this.life <= 0;
    }

    get alpha() {
        return this.life / this.maxLife;
    }
}

export function renderBullets(draw, gl, bullets) {
    const fillCol = [];
    const glowCol = [];
    for (let i = 0; i < bulletShape.length / 2; i++) {
        fillCol.push(0.9, 0.95, 1);
        glowCol.push(0.4, 0.5, 0.8);
    }

    for (const b of bullets) {
        draw(gl.TRIANGLES, bulletGlow, glowCol, b.x, b.y, 1, 0);
        draw(gl.TRIANGLES, bulletShape, fillCol, b.x, b.y, 1, 0);
    }
}
