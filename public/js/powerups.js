import { buildCol } from './utils.js';

export const PowerupTypes = {
    RAPID_FIRE: 'rapidFire',
    NUKE: 'nuke',
    SPLIT_SHOT: 'splitShot',
    LONG_RANGE: 'longRange',
    SHIELD: 'shield',
};

const pwColors = {
    [PowerupTypes.RAPID_FIRE]: [1, 0.25, 0.2],
    [PowerupTypes.NUKE]: [1, 1, 1],
    [PowerupTypes.SPLIT_SHOT]: [0.3, 1, 0.6],
    [PowerupTypes.LONG_RANGE]: [0.8, 0.2, 0.8],
    [PowerupTypes.SHIELD]: [0.3, 0.8, 1],
};

const pwLabels = {
    [PowerupTypes.RAPID_FIRE]: 'R',
    [PowerupTypes.NUKE]: 'N',
    [PowerupTypes.SPLIT_SHOT]: 'S',
    [PowerupTypes.LONG_RANGE]: 'L',
    [PowerupTypes.SHIELD]: 'H',
};

const DURATION = {
    [PowerupTypes.RAPID_FIRE]: 720,
    [PowerupTypes.SPLIT_SHOT]: 720,
    [PowerupTypes.LONG_RANGE]: 720,
    [PowerupTypes.SHIELD]: 720,
};

const diamondVerts = [0, -16, 16, 0, 0, 16, -16, 0];
const pwVertCount = diamondVerts.length / 2;

export class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 600;
        this.maxLife = 600;
    }

    update() {
        this.life--;
    }

    get expired() {
        return this.life <= 0;
    }

    get shouldBlink() {
        return this.life < 120 && Math.floor(this.life / 8) % 2;
    }

    getDuration() {
        return DURATION[this.type] || 720;
    }
}

export function getPowerupColor(type) {
    return pwColors[type] || [1, 1, 1];
}

export function getPowerupLabel(type) {
    return pwLabels[type] || '?';
}

export function getAllPowerupTypes() {
    return Object.values(PowerupTypes);
}

export function renderPowerups(draw, gl, powerups, frame) {
    for (const pw of powerups) {
        if (pw.shouldBlink) continue;

        const col = getPowerupColor(pw.type);
        const pulse = 1 + Math.sin(frame * 0.08) * 0.15;

        const outlineCol = buildCol(pwVertCount, col[0], col[1], col[2]);
        draw(gl.LINE_LOOP, diamondVerts, outlineCol, pw.x, pw.y, pulse, 0);

        const innerCol = buildCol(pwVertCount, col[0] * 0.4, col[1] * 0.4, col[2] * 0.4);
        draw(gl.TRIANGLE_FAN, diamondVerts, innerCol, pw.x, pw.y, pulse * 0.7, 0);
    }
}
