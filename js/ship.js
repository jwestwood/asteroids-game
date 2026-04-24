export const shipFill = [
    18, 0, 10, -6, -8, -14, -12, -10, -6, -4,
    4, 0, -6, 4, -12, 10, -8, 14, 10, 6
];
const shipFillCol = buildCol(shipFill.length / 2, 0.95, 0.95, 1);

export const shipOutline = [
    18, 0, 10, -6, -8, -14, -12, -10, -6, -4,
    4, 0, -6, 4, -12, 10, -8, 14, 10, 6, 18, 0
];
const shipOutlineCol = buildCol(shipOutline.length / 2, 0.6, 0.7, 0.9);

export const shipCockpit = [8, 0, 0, -4, -4, 0, 0, 4];
const shipCockpitCol = buildCol(shipCockpit.length / 2, 0.3, 0.5, 0.8);

export const shipEngineL = [-10, -6, -16, -10, -12, -8];
const shipEngineLCol = buildCol(shipEngineL.length / 2, 0.7, 0.7, 0.75);

export const shipEngineR = [-10, 6, -16, 10, -12, 8];
const shipEngineRCol = buildCol(shipEngineR.length / 2, 0.7, 0.7, 0.75);

export const flameTri = [-12, 0, -26, -10, -26, 10];
export const flameCol = [1, 0.6, 0.1, 1, 0.3, 0, 1, 0.8, 0.15];

function buildCol(n, r, g, b) {
    const c = [];
    for (let i = 0; i < n; i++) c.push(r, g, b);
    return c;
}

export function renderShip(draw, gl, ship, keys) {
    if (!ship.alive) return;
    if (ship.invincible > 0 && Math.floor(ship.invincible / 4) % 2) return;
    draw(gl.TRIANGLES, shipFill, shipFillCol, ship.x, ship.y, 1, ship.angle);
    draw(gl.LINE_STRIP, shipOutline, shipOutlineCol, ship.x, ship.y, 1, ship.angle);
    draw(gl.LINE_STRIP, shipCockpit, shipCockpitCol, ship.x, ship.y, 1, ship.angle);
    draw(gl.TRIANGLES, shipEngineL, shipEngineLCol, ship.x, ship.y, 1, ship.angle);
    draw(gl.TRIANGLES, shipEngineR, shipEngineRCol, ship.x, ship.y, 1, ship.angle);
    if (keys['ArrowUp'] || keys['KeyW']) {
        draw(gl.TRIANGLES, flameTri, flameCol, ship.x, ship.y, 1, ship.angle);
    }
}
