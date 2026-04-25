import { state, update, resetGame, keys } from './js/game.js';
import { renderShip } from './js/ship.js';
import { renderAsteroids } from './js/asteroids.js';
import { renderBullets } from './js/bullets.js';
import { renderParticles } from './js/particles.js';
import { renderPowerups } from './js/powerups.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const gl = canvas.getContext('webgl');

const W = () => canvas.width;
const H = () => canvas.height;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function makeVsSource() {
    return `
attribute vec2 aPos;
uniform vec2 uTrans;
uniform vec2 uScale;
uniform float uAngle;
void main() {
    float c = cos(uAngle), s = sin(uAngle);
    vec2 p = vec2(aPos.x * c - aPos.y * s, aPos.x * s + aPos.y * c);
    gl_Position = vec4((p * uScale + uTrans) / vec2(${W()}, ${H()}) * 2.0 - 1.0, 0, 1);
    gl_PointSize = uScale.x * 2.0;
}
`;
}

const vsSource = makeVsSource();

const fsSource = `
precision mediump float;
uniform vec3 uColor;
uniform vec4 uColorAttr;
uniform float uUseAttr;
uniform float uAlpha;
void main() {
    vec3 c = uUseAttr > 0.5 ? uColorAttr.rgb : uColor;
    gl_FragColor = vec4(c, uAlpha);
}
`;

function compileShader(src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
    }
    return s;
}

const vs = compileShader(vsSource, gl.VERTEX_SHADER);
const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
const prog = gl.createProgram();
gl.attachShader(prog, vs);
gl.attachShader(prog, fs);
gl.linkProgram(prog);
gl.useProgram(prog);

const aPos = gl.getAttribLocation(prog, 'aPos');
const uTrans = gl.getUniformLocation(prog, 'uTrans');
const uScale = gl.getUniformLocation(prog, 'uScale');
const uAngle = gl.getUniformLocation(prog, 'uAngle');
const uColor = gl.getUniformLocation(prog, 'uColor');
const uColorAttr = gl.getUniformLocation(prog, 'uColorAttr');
const uUseAttr = gl.getUniformLocation(prog, 'uUseAttr');
const uAlpha = gl.getUniformLocation(prog, 'uAlpha');

const buf = gl.createBuffer();
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

function draw(mode, verts, col, tx, ty, sc, ang, ptSize, alpha) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
    gl.uniform2f(uTrans, tx, ty);
    gl.uniform2f(uScale, sc, sc);
    gl.uniform1f(uAngle, ang || 0);
    gl.uniform1f(uAlpha, alpha !== undefined ? alpha : 1);
    if (col) {
        gl.uniform3f(uColorAttr, col[0], col[1], col[2]);
        gl.uniform1f(uUseAttr, 1);
    } else {
        gl.uniform3f(uColor, 1, 1, 1);
        gl.uniform1f(uUseAttr, 0);
    }
    if (ptSize) gl.uniform1f(uScale, ptSize);
    gl.drawArrays(mode, 0, verts.length / 2);
}

// Override W/H in the shader for resize
function updateShaderSize() {
    const newVs = makeVsSource();
    const newVs2 = compileShader(newVs, gl.VERTEX_SHADER);
    const newProg = gl.createProgram();
    gl.attachShader(newProg, newVs2);
    gl.attachShader(newProg, fs);
    gl.linkProgram(newProg);
    gl.useProgram(newProg);
}

let frame = 0;

function gameLoop() {
    frame++;
    update(W, H);
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W(), H());

    gl.clearColor(0.02, 0.02, 0.06, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    renderPowerups(draw, gl, state.powerups, frame);
    renderAsteroids(draw, gl, state.asteroids);
    renderBullets(draw, gl, state.bullets);
    renderShip(draw, gl, state.ship, keys, state.activePowerups);
    renderParticles(draw, gl, state.particles);

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.fillText(`Score: ${state.score}`, 15, 30);
    ctx.fillText(`Level: ${state.level}`, 15, 55);
    ctx.fillText(`Lives: ${state.lives}`, 15, 80);

    // Active powerup indicators
    let py = 110;
    const powerupNames = { rapidFire: 'Rapid Fire', splitShot: 'Split Shot', longRange: 'Long Range', shield: 'Shield' };
    for (const [k, v] of Object.entries(state.activePowerups)) {
        if (v > 0) {
            ctx.fillStyle = k === 'shield' ? '#5cf' : '#ff0';
            ctx.fillText(`${powerupNames[k]}: ${Math.ceil(v / 60)}s`, 15, py);
            py += 22;
        }
    }

    if (!state.gameStarted) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W(), H());
        ctx.fillStyle = '#fff';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ASTEROIDS', W() / 2, H() / 2 - 40);
        ctx.font = '24px monospace';
        ctx.fillText('Press SPACE to start', W() / 2, H() / 2 + 20);
        ctx.textAlign = 'left';
    }

    if (state.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W(), H());
        ctx.fillStyle = '#f55';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W() / 2, H() / 2 - 40);
        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.fillText(`Final Score: ${state.score}`, W() / 2, H() / 2 + 20);
        ctx.fillText('Press SPACE to restart', W() / 2, H() / 2 + 55);
        ctx.textAlign = 'left';
    }

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => {
    if (e.code === 'Space') {
        if (!state.gameStarted) {
            state.gameStarted = true;
            resetGame(W, H);
        } else if (state.gameOver) {
            state.gameOver = false;
            state.score = 0;
            state.lives = 3;
            state.level = 1;
            resetGame(W, H);
        }
    }
});

gameLoop();
