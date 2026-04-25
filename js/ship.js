import { buildCol } from './utils.js';

const shipVerts = [22,0, 10,-14, -8,-5, -8,5, 10,14];
const engineGlow = [-8,-5, -8,5, -30,0];
const engineCol = [];
for (let i = 0; i < engineGlow.length / 2; i++) engineCol.push(1, 0.3, 0.15);

const shieldVerts = [];
const shieldCol = [];
for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    shieldVerts.push(Math.cos(a) * 80, Math.sin(a) * 80);
    shieldCol.push(0.2, 0.7, 1);
}

const shipVertCount = shipVerts.length / 2;

export function renderShip(draw, gl, ship, keys, activePowerups) {
    if (!ship.alive) return;
    if (ship.invincible > 0 && Math.floor(ship.invincible / 4) % 2) return;

    const shieldActive = activePowerups.shield > 0;
    const shieldAlpha = shieldActive ? 0.3 + Math.sin(Date.now() * 0.005) * 0.15 : 0;

    if (shieldAlpha > 0) {
        draw(gl.LINE_LOOP, shieldVerts, shieldCol, ship.x, ship.y, 1, 0, 0, shieldAlpha);
    }

    const engOn = keys['ArrowUp'] || keys['KeyW'];

    if (engOn) {
        const flicker = 0.8 + Math.random() * 0.2;
        draw(gl.TRIANGLES, engineGlow, engineCol, ship.x, ship.y, flicker, ship.angle);
    }

    const shipCol = buildCol(shipVertCount, 0.9, 0.9, 1);
    draw(gl.LINE_LOOP, shipVerts, shipCol, ship.x, ship.y, 1, ship.angle);
}
