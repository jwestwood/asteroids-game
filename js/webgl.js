const vsSource = `
    attribute vec2 aPos;
    attribute vec3 aColor;
    uniform vec2 uRes;
    uniform vec2 uTrans;
    uniform float uScale;
    uniform float uRot;
    varying vec3 vCol;
    void main() {
        float c = cos(uRot), s = sin(uRot);
        vec2 p = vec2(aPos.x * c - aPos.y * s, aPos.x * s + aPos.y * c);
        vec2 wp = p * uScale + uTrans;
        gl_Position = vec4((wp.x / uRes.x) * 2.0 - 1.0, 1.0 - (wp.y / uRes.y) * 2.0, 0, 1);
        vCol = aColor;
    }
`;

const fsSource = `
    precision mediump float;
    varying vec3 vCol;
    void main() { gl_FragColor = vec4(vCol, 1); }
`;

export function initWebGL(canvas) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) throw new Error('WebGL not supported');

    function compile(src, type) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(s));
        }
        return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(vsSource, gl.VERTEX_SHADER));
    gl.attachShader(prog, compile(fsSource, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const aPosLoc = gl.getAttribLocation(prog, 'aPos');
    const aColLoc = gl.getAttribLocation(prog, 'aColor');
    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTrans = gl.getUniformLocation(prog, 'uTrans');
    const uScale = gl.getUniformLocation(prog, 'uScale');
    const uRot = gl.getUniformLocation(prog, 'uRot');

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(aPosLoc);
    gl.enableVertexAttribArray(aColLoc);

    function draw(mode, pos, color, tx, ty, sc, rot) {
        const n = pos.length / 2;
        const data = new Float32Array(n * 5);
        for (let i = 0; i < n; i++) {
            data[i * 5]     = pos[i * 2];
            data[i * 5 + 1] = pos[i * 2 + 1];
            data[i * 5 + 2] = color[i * 3];
            data[i * 5 + 3] = color[i * 3 + 1];
            data[i * 5 + 4] = color[i * 3 + 2];
        }
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
        const stride = 5 * 4;
        gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, stride, 0);
        gl.vertexAttribPointer(aColLoc, 3, gl.FLOAT, false, stride, 8);
        gl.uniform2f(uRes, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(uTrans, tx, ty);
        gl.uniform1f(uScale, sc);
        gl.uniform1f(uRot, rot);
        gl.drawArrays(mode, 0, n);
    }

    return { gl, draw };
}
