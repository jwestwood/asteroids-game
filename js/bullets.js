const bulletShape = [0, -5, 4, -2, 0, 5, -4, -2];
const bulletFillCol = [];
for (let i = 0; i < bulletShape.length / 2; i++) bulletFillCol.push(0.9, 0.95, 1);

const bulletGlow = [0, -7, 6, -3, 0, 7, -6, -3];
const bulletGlowCol = [];
for (let i = 0; i < bulletGlow.length / 2; i++) bulletGlowCol.push(0.4, 0.5, 0.8);

export function renderBullets(draw, gl, bullets) {
    for (const b of bullets) {
        draw(gl.TRIANGLES, bulletGlow, bulletGlowCol, b.x, b.y, 1, 0);
        draw(gl.TRIANGLES, bulletShape, bulletFillCol, b.x, b.y, 1, 0);
    }
}
