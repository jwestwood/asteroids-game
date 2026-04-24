const pwColors = {
    invincible: [1, 0.85, 0.2],
    rapidFire: [1, 0.25, 0.2],
    nuke: [1, 1, 1],
    splitShot: [0.3, 1, 0.9],
    longRange: [0.5, 0.8, 1],
};

const pwLabels = {
    invincible: 'I',
    rapidFire: 'R',
    nuke: 'N',
    splitShot: 'S',
    longRange: 'L',
};

function diamondVerts(r) {
    return [0, -r, r, 0, 0, r, -r, 0];
}

function buildCol(n, r, g, b) {
    const c = [];
    for (let i = 0; i < n; i++) c.push(r, g, b);
    return c;
}

export function getPowerupColor(type) {
    return pwColors[type] || [1, 1, 1];
}

export function getPowerupLabel(type) {
    return pwLabels[type] || '?';
}

const pwVerts = diamondVerts(16);
const pwVertCount = pwVerts.length / 2;

export function renderPowerups(draw, gl, powerups, frame) {
    for (const pw of powerups) {
        const col = pwColors[pw.type] || [1, 1, 1];
        const blink = pw.life < 120 && Math.floor(pw.life / 8) % 2;
        if (blink) continue;

        const pulse = 1 + Math.sin(frame * 0.08) * 0.15;

        const outlineCol = buildCol(pwVertCount, col[0], col[1], col[2]);
        draw(gl.LINE_LOOP, pwVerts, outlineCol, pw.x, pw.y, pulse, 0);

        const innerCol = buildCol(pwVertCount, col[0] * 0.4, col[1] * 0.4, col[2] * 0.4);
        draw(gl.TRIANGLE_FAN, pwVerts, innerCol, pw.x, pw.y, pulse * 0.7, 0);
    }
}
